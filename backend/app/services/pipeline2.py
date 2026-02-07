# backend/app/services/pipeline2.py

import spacy
import concurrent.futures
import re
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.fact_models import Fact, Job, Disease, Stage
from app.services.scraper import scrape_url
from app.services.ra_vocabulary import RA_STAGES, BAD_STRUCTURE_PATTERNS, META_KEYWORDS, BAD_START_WORDS
from app.services.compliance import check_compliance_for_url
from app.models.fact_models import ComplianceResult

# --- INITIALIZATION ---
print("Loading NLP Model...")
# Disable everything except parser/tagger for speed
nlp = spacy.load("en_core_web_sm", disable=["ner", "lemmatizer", "textcat"]) 
print("Model Loaded.")

def is_grammatically_plausible(sent_doc) -> bool:
    """
    Minimal Grammar Check.
    Accepts the sentence if it contains at least a Noun or a Verb.
    This prevents '12.' or 'Table 1' but allows 'Median score was 0.'
    """
    for token in sent_doc:
        if token.pos_ in ["NOUN", "PROPN", "VERB", "AUX"]:
            return True
    return False

def validate_sentence_content(text: str) -> bool:
    text_lower = text.lower()
    
    # 1. Start Word Check
    if text_lower.split()[0] in BAD_START_WORDS:
        return False

    # 2. Qualitative/Meta Language Check (The "Gibberish" Filter)
    for meta in META_KEYWORDS:
        if meta in text_lower:
            return False
            
    # 3. Structural Patterns (URLs, etc.)
    for pattern in BAD_STRUCTURE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return False
            
    return True

def process_url(url: str, stage_config: dict, limit: int,stage_id: int, db: Session) -> list[dict]:
    """
    Extracts up to 'limit' facts from the URL.
    """
    try:
        raw_text = scrape_url(url)
        if not raw_text:
            return []

        # Process first 100k chars to ensure we don't miss content
        doc = nlp(raw_text[:100000]) 
        candidates = []
        
        keywords = stage_config["keywords"]
        negative_keywords = stage_config.get("negative_keywords", [])

        for sent in doc.sents:
            clean_text = sent.text.strip().replace("\n", " ")
            word_count = len(clean_text.split())
            
            # Length: 5 to 60 words (Matches your "Good" examples)
            if word_count < 5 or word_count > 60:
                continue

            # Content Filter (Crucial for removing "views", "aims")
            if not validate_sentence_content(clean_text):
                continue

            # Grammar Filter
            if not is_grammatically_plausible(sent):
                continue

            text_lower = clean_text.lower()
            score = 0
            
            # Scoring
            for word, weight in keywords.items():
                if word in text_lower:
                    score += weight
            
            # Negative Penalties
            for word in negative_keywords:
                if word in text_lower:
                    score = -100 # Kill it immediately

            # Threshold: > 0 means AT LEAST ONE keyword matched.
            # We rely on sorting to find the "best" ones.
            if score > 0:
                candidates.append({"text": clean_text, "score": score, "source": url})

        # Sort by score (High relevance first)
        candidates.sort(key=lambda x: x["score"], reverse=True)
        

        existing_check = db.query(ComplianceResult).filter(
            ComplianceResult.url == url, 
            ComplianceResult.stage_id == stage_id
        ).first()

        if not existing_check:
            compliance_data = check_compliance_for_url(url)
            new_compliance = ComplianceResult(
                url=url,
                status=compliance_data["status"],
                reason=compliance_data["reason"],
                stage_id=stage_id
            )
            db.add(new_compliance)
            db.commit()
        # Return the top 'limit' facts
        return candidates[:limit]

    except Exception as e:
        print(f"Error processing {url}: {e}")
        return []

def process_extraction_job(job_id: int, urls: list, disease_name: str, stage_name: str, keywords_input: str, max_facts: int):
    """
    max_facts = Target number of facts PER URL.
    """
    db = SessionLocal()
    try:
        print(f"--- Starting Job {job_id} [High Yield Mode] ---")
        
        # 1. Config Setup
        stage_key = None
        for key in RA_STAGES.keys():
            if str(stage_name).lower() in key.lower() or key.lower() in str(stage_name).lower():
                stage_key = key
                break
        
        if not stage_key:
            stage_config = {
                "keywords": {k.strip().lower(): 5 for k in keywords_input.split(",") if k.strip()},
                "negative_keywords": []
            }
        else:
            stage_config = RA_STAGES[stage_key]
            if keywords_input:
                for k in keywords_input.split(","):
                    if k.strip(): 
                        stage_config["keywords"][k.strip().lower()] = 10

        # 2. Database Entities
        job = db.query(Job).filter(Job.id == job_id).first()
        disease_entry = db.query(Disease).filter(Disease.name == disease_name).first() 
        if not disease_entry:
            disease_entry = Disease(name=disease_name)
            db.add(disease_entry); db.commit()
        
        stage_entry = db.query(Stage).filter(Stage.name == stage_name, Stage.disease_id == disease_entry.id).first()
        if not stage_entry:
            stage_entry = Stage(name=stage_name, disease_id=disease_entry.id)
            db.add(stage_entry); db.commit()
        target_stage_id = stage_entry.id

        # 3. Execution
        seen_texts_hashes = set()
        total_urls_processed = 0
        total_facts_saved = 0

        # 4 Workers is safe for most systems
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            # We pass 'max_facts' to the worker so it knows how many to grab per URL
            future_to_url = {executor.submit(process_url, url, stage_config, max_facts,target_stage_id, db): url for url in urls}
            
            for future in concurrent.futures.as_completed(future_to_url):
                try:
                    results = future.result()
                    batch_to_save = []
                    
                    if results:
                        total_urls_processed += 1
                    
                    for item in results:
                        # Deduplication (Exact Match Only for speed)
                        txt_hash = hash(item["text"])
                        if txt_hash in seen_texts_hashes: continue
                        seen_texts_hashes.add(txt_hash)
                        
                        batch_to_save.append(Fact(
                            stage_id=target_stage_id,
                            job_id=job_id,
                            fact_text=item["text"],
                            source_url=item["source"],
                            status="PENDING"
                        ))
                        total_facts_saved += 1
                    
                    if batch_to_save:
                        db.add_all(batch_to_save)
                        db.commit()
                        
                except Exception as exc:
                    print(f"Worker Exception: {exc}")

        job.status = "COMPLETED"
        job.total_urls = len(urls)
        db.commit()
        print(f"Job Finished. URLs with Data: {total_urls_processed}/{len(urls)}. Total Facts: {total_facts_saved}")

    except Exception as e:
        print(f"Fatal Pipeline Error: {e}")
        job = db.query(Job).filter(Job.id == job_id).first()
        job.status = "FAILED"
        db.commit()
    finally:
        db.close()