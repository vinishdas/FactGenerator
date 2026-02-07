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
# Keep parser/tagger for sentence segmentation and POS tagging (needed for grammar check)
nlp = spacy.load("en_core_web_sm", disable=["ner", "lemmatizer", "textcat"]) 
print("Model Loaded.")

# --- COMPILED REGEX HELPERS ---
# Compiling these once is much faster than re-compiling per sentence
PRONOUN_START_REGEX = re.compile(r"^(It|They|These|Those|This|He|She)\b", re.IGNORECASE)
NUMBER_REGEX = re.compile(r"\d")

def is_grammatically_plausible(sent_doc) -> bool:
    """
    Minimal Grammar Check.
    Accepts the sentence if it contains at least a Noun or a Verb.
    """
    has_noun = False
    has_verb = False
    for token in sent_doc:
        if token.pos_ in ["NOUN", "PROPN"]:
            has_noun = True
        elif token.pos_ in ["VERB", "AUX"]:
            has_verb = True
    return has_noun and has_verb

def validate_sentence_content(text: str) -> bool:
    text_lower = text.lower()
    
    # 1. Start Word Check
    first_word = text_lower.split()[0] if text_lower else ""
    if first_word in BAD_START_WORDS:
        return False

    # 2. Qualitative/Meta Language Check (The "Gibberish" Filter)
    for meta in META_KEYWORDS:
        # Use simple inclusion for meta words as they are often distinct
        if meta in text_lower:
            return False
            
    # 3. Structural Patterns (URLs, etc.)
    for pattern in BAD_STRUCTURE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return False
            
    return True

def calculate_fact_score(text: str, keywords: dict, negative_keywords: list) -> float:
    """
    Advanced Scoring Algorithm:
    1. Regex Boundary Matching: Prevents 'age' matching 'dosage'.
    2. Density Boost: Rewards sentences with MULTIPLE distinct keywords.
    3. Data Boost: Rewards sentences with numbers (clinical data).
    """
    text_lower = text.lower()
    base_score = 0
    unique_hits = 0
    
    # 1. Negative Filter (Immediate Kill)
    for neg in negative_keywords:
        # Strict boundary check for negatives too
        if re.search(r"\b" + re.escape(neg) + r"\b", text_lower):
            return -100

    # 2. Positive Scoring with Boundaries
    for word, weight in keywords.items():
        # \b ensures we match "RA" but not "fRActure" or "gRAde"
        # Escaping ensures symbols like "+" don't break regex
        pattern = r"\b" + re.escape(word) + r"\b"
        if re.search(pattern, text_lower):
            base_score += weight
            unique_hits += 1

    if base_score <= 0:
        return 0

    # 3. Density Multiplier
    # A sentence with 3 different keywords is better than 1 keyword repeated
    density_multiplier = 1.0 + (0.1 * unique_hits)

    # 4. Data Boost
    # Sentences with numbers (e.g., "50%", "Stage 2", "20mg") are more likely to be factual
    data_multiplier = 1.2 if NUMBER_REGEX.search(text) else 1.0

    return base_score * density_multiplier * data_multiplier

def process_url(url: str, stage_config: dict, limit: int, stage_id: int, db: Session) -> list[dict]:
    """
    Extracts up to 'limit' facts from the URL using Context-Aware Extraction.
    """
    try:
        raw_text = scrape_url(url)
        if not raw_text:
            return []

        doc = nlp(raw_text[:150000]) # Increased buffer slightly
        candidates = []
        
        keywords = stage_config["keywords"]
        negative_keywords = stage_config.get("negative_keywords", [])

        previous_sent_text = ""
        
        for sent in doc.sents:
            clean_text = sent.text.strip().replace("\n", " ")
            word_count = len(clean_text.split())
            
            # Length Filter
            if word_count < 5 or word_count > 60:
                previous_sent_text = clean_text # Store for context even if skipped
                continue

            # Content Filter
            if not validate_sentence_content(clean_text):
                previous_sent_text = clean_text
                continue

            # Grammar Filter
            if not is_grammatically_plausible(sent):
                previous_sent_text = clean_text
                continue

            # --- CONTEXT FUSION (The "Smart" Upgrade) ---
            # If sentence starts with "It", "They", "These", merge with previous
            # to capture the full context (e.g., "Methotrexate is a DMARD. It works by...")
            final_text = clean_text
            if previous_sent_text and PRONOUN_START_REGEX.match(clean_text):
                # Only merge if previous was decent length
                if len(previous_sent_text.split()) > 3:
                    final_text = f"{previous_sent_text} {clean_text}"

            # Score the (potentially merged) text
            score = calculate_fact_score(final_text, keywords, negative_keywords)
            
            if score > 0:
                candidates.append({"text": final_text, "score": score, "source": url})
            
            # Update buffer
            previous_sent_text = clean_text

        # Sort by score (High relevance first)
        candidates.sort(key=lambda x: x["score"], reverse=True)
        
        # Compliance Check (Database Logic)
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

        return candidates[:limit]

    except Exception as e:
        print(f"Error processing {url}: {e}")
        return []

def process_extraction_job(job_id: int, urls: list, disease_name: str, stage_name: str, keywords_input: str, max_facts: int):
    """
    Main Pipeline Orchestrator.
    """
    db = SessionLocal()
    try:
        print(f"--- Starting Job {job_id} [Context-Aware Mode] ---")
        
        # 1. Config Setup
        stage_key = None
        for key in RA_STAGES.keys():
            if str(stage_name).lower() in key.lower() or key.lower() in str(stage_name).lower():
                stage_key = key
                break
        
        if not stage_key:
            # Fallback for custom stages
            stage_config = {
                "keywords": {k.strip().lower(): 5 for k in keywords_input.split(",") if k.strip()},
                "negative_keywords": []
            }
        else:
            stage_config = RA_STAGES[stage_key]
            # Boost user-provided keywords if any
            if keywords_input:
                for k in keywords_input.split(","):
                    if k.strip(): 
                        stage_config["keywords"][k.strip().lower()] = 12 # Higher weight than default

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

        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            future_to_url = {executor.submit(process_url, url, stage_config, max_facts, target_stage_id, db): url for url in urls}
            
            for future in concurrent.futures.as_completed(future_to_url):
                try:
                    results = future.result()
                    batch_to_save = []
                    
                    if results:
                        total_urls_processed += 1
                    
                    for item in results:
                        # Normalize before hashing (Strip whitespace/casing)
                        txt_hash = hash(item["text"].strip().lower())
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