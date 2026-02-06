import trafilatura
import requests
import joblib
import os
import random
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer

# IMPORTS
from app.models.singapore_compliance import SingaporeCompliance
# ⚠️ MAKE SURE THIS IMPORT IS CORRECT FOR YOUR PROJECT
from app.models.fact_models import Fact 

# 1. Load ML Model
MODEL_PATH = "app/compliance_model.pkl"

try:
    if os.path.exists(MODEL_PATH):
        ml_pipeline = joblib.load(MODEL_PATH)
        print("✅ Compliance ML Model Loaded.")
    else:
        print(f"⚠️ WARNING: {MODEL_PATH} not found. Predictions will default to UNKNOWN.")
        ml_pipeline = None
except Exception as e:
    print(f"❌ Error loading model: {e}")
    ml_pipeline = None

# 2. Load Embedding Model
embedder = SentenceTransformer('all-MiniLM-L6-v2')

class ComplianceScanner:
    
    @staticmethod
    def scrape_everything(url: str) -> str:
        """
        Robust Scraper: Uses Trafilatura (for articles) + Requests (fallback).
        """
        print(f"🔍 Deep Scanning: {url}")
        
        # Method 1: Trafilatura
        try:
            downloaded = trafilatura.fetch_url(url)
            if downloaded:
                text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
                if text and len(text) > 100:
                    return text
        except:
            pass

        # Method 2: Requests with Headers
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                for junk in soup(["script", "style", "meta", "noscript"]):
                    junk.decompose()
                return soup.get_text(separator=' ', strip=True)
        except:
            pass
            
        return None

    @staticmethod
    def process_url(db: Session, url: str):
        # 1. Scrape
        content = ComplianceScanner.scrape_everything(url)
        if not content:
            content = ""
            status = "ERROR"
            confidence = 0.0
        else:
            # 2. AI Prediction
            status = "UNKNOWN"
            confidence = 0.0
            if ml_pipeline:
                probs = ml_pipeline.predict_proba([content])[0]
                pass_score = float(probs[1] * 100)
                status = "PASS" if pass_score > 50 else "FAIL"
                confidence = pass_score if status == "PASS" else float(probs[0] * 100)

        # 3. Generate Artifacts
        keywords = {}
        triggers = ["cure", "guaranteed", "miracle", "buy now", "no side effects"]
        content_lower = content.lower()
        for t in triggers:
            if t in content_lower:
                keywords[t] = content_lower.count(t)

        vector = embedder.encode(content[:1000] if content else "empty").tolist()

        # =========================================================
        # CRITICAL FIX: MANAGE FOREIGN KEY DEPENDENCY
        # =========================================================
        # We must attach this result to a Fact. 
        # Strategy: Check if Fact exists for this URL, if not, create it.
        
        existing_fact = db.query(Fact).filter(Fact.source_url == url).first()
        
        if existing_fact:
            fact_id = existing_fact.id
            print(f"🔗 Linking to existing Fact ID: {fact_id}")
        else:
            print(f"❌ URL not found in database: {url}")
            print("To add compliance results, the URL must first be processed by the Fact Generator.")
            return None
            # # Create a new Parent Fact
            # new_fact = Fact(url=url, content=content[:500] if content else "Scan Error")
            # db.add(new_fact)
            # db.flush() # This generates the ID without committing yet
            # fact_id = new_fact.id
            # print(f"🆕 Created new Fact ID: {fact_id}")

        # 4. Save Compliance Result linked to Fact ID
        compliance_entry = SingaporeCompliance(
            id=fact_id,  # <--- THIS IS THE FOREIGN KEY LINK
            url=url,
            status=status,
            confidence_score=round(confidence, 2),
            snippet=content[:500] if content else "No Content",
            full_text_content=content,
            matched_keywords=keywords,
            embedding=vector
        )

        # Merge handles insert or update if it already exists
        db.merge(compliance_entry) 
        db.commit()
        
        return compliance_entry