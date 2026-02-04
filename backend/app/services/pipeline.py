import spacy
import ollama
import json
from sqlalchemy.orm import Session
# Add Disease and Stage to imports
from app.models.fact_models import Fact, Job, Disease, Stage
from app.services.scraper import scrape_url
from app.database import SessionLocal
from app.services.vector_utils import get_embedding, is_duplicate

# --- INITIALIZATION remains the same ---
print("Loading NLP Models...")
nlp = spacy.load("en_core_web_sm")
print("Models Loaded.")

def process_extraction_job(job_id: int, urls: list, disease_name_input: str, stage_name_input: str, keywords: str, max_facts: int):
    db = SessionLocal()
    
    try:
        print(f"--- Starting Job {job_id} for {disease_name_input} / {stage_name_input} ---")
        
        # --- STEP A: Find or Create Disease/Stage Structure ---
        # 1. Clean inputs
        d_name_clean = disease_name_input.strip()
        s_name_clean = stage_name_input.strip()

        # 2. Find or create Disease
        disease_entry = db.query(Disease).filter(Disease.name == d_name_clean).first()
        if not disease_entry:
            disease_entry = Disease(name=d_name_clean)
            db.add(disease_entry)
            db.commit()
            db.refresh(disease_entry)
            print(f"Created new Disease entry: {d_name_clean}")

        # 3. Find or create Stage for that Disease
        stage_entry = db.query(Stage).filter(
            Stage.name == s_name_clean,
            Stage.disease_id == disease_entry.id
        ).first()
        if not stage_entry:
            stage_entry = Stage(name=s_name_clean, disease_id=disease_entry.id)
            db.add(stage_entry)
            db.commit()
            db.refresh(stage_entry)
            print(f"Created new Stage entry: {s_name_clean}")

        # Get the final ID to link facts to
        target_stage_id = stage_entry.id
        
        # --- STEP B: The Extraction Loop (Mostly unchanged) ---
        facts_collected_in_this_job = 0
        keyword_list = [k.strip().lower() for k in keywords.split(",")] if keywords else []
        keyword_list.append(d_name_clean.lower())
        keyword_list.append(s_name_clean.lower())

        for url in urls:
            if facts_collected_in_this_job >= (max_facts * len(urls)): break 

            # 1. Scrape & 2. Sieve (Same as before...)
            raw_text = scrape_url(url)
            if not raw_text: continue
            doc = nlp(raw_text)
            candidates = []
            for sent in doc.sents:
                if any(k in sent.text.lower() for k in keyword_list) and len(sent.text) > 20:
                     candidates.append(sent.text.strip().replace("\n", " "))

            # 3. Batched AI (Same as before...)
            batch_size = 5
            batches = [candidates[i:i + batch_size] for i in range(0, len(candidates), batch_size)]
            for batch in batches:
                batch_text = "\n- ".join(batch)
                prompt = f"""
                     You are extracting medical facts.

                    Input context:
                    Disease: {d_name_clean}
                    System: {s_name_clean}

                    Task:
                    From the sentences below, extract only factual medical statements.

                    Constraints:
                    - Output ONLY valid JSON.
                    - Output must be a JSON array of strings.
                    - Each string is a single, standalone medical fact.
                    - Each fact must be ≤ 15 words.
                    - No introductions, explanations, notes, or extra text.
                    - Ignore non-medical, vague, speculative, or irrelevant sentences completely.
                    - Do not paraphrase beyond making the fact concise and standalone.

                    Example output format:
                    ["fact one", "fact two"]

                    Sentences:
                    {batch_text}
                """
                try:
                    response = ollama.chat(model='llama3.2', messages=[{'role': 'user', 'content': prompt}])
                    content = response['message']['content']
                    try: new_facts = json.loads(content)
                    except: new_facts = [] # Simplified error handling for brevity

                    # --- STEP C: Deduplication & Saving (UPDATED) ---
                    for fact_text in new_facts:
                        if isinstance(fact_text, str) and len(fact_text) > 4:
                            vector = get_embedding(fact_text)
                            
                            # CRITICAL CHANGE: Check against stage_id, not job_id
                            if not is_duplicate(db, target_stage_id, vector):
                                db_fact = Fact(
                                    stage_id=target_stage_id, # Link to permanent structure
                                    job_id=job_id,            # Link to extraction batch trace
                                    fact_text=fact_text,
                                    source_url=url,
                                    embedding=vector,
                                    status="PENDING"
                                )
                                db.add(db_fact)
                                facts_collected_in_this_job += 1
                    db.commit()
                except Exception as e: 
                    print(f"Batch err: {e}") 
                    continue

        # FINISH JOB
        job = db.query(Job).filter(Job.id == job_id).first()
        job.status = "COMPLETED"
        db.commit()
        print(f"--- Job {job_id} Completed ---")

    except Exception as e:
        print(f"Pipeline Error: {e}")
        job = db.query(Job).filter(Job.id == job_id).first()
        job.status = "FAILED"
        db.commit()
        db.close()
    finally:
        if db: db.close()