from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.fact_models import Job, Fact
from app.services.csv_handler import parse_csv_urls
from app.services.pipeline import process_extraction_job

router = APIRouter(prefix="/facts", tags=["Fact Generator"])

@router.post("/generate")
async def generate_facts(
    background_tasks: BackgroundTasks,
    disease: str = Form(...),
    stage: str = Form(...),
    keywords: str = Form(""),
    max_facts: int = Form(10),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Parse CSV
    content = await file.read()
    urls = parse_csv_urls(content)
    
    if not urls:
        raise HTTPException(status_code=400, detail="CSV file empty or no 'source/url' column found.")

    # 2. Create Job Entry
    new_job = Job(
        disease_name_log=disease, 
        stage_name_log=stage, 
        total_urls=len(urls),
        status="PROCESSING"
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # 3. Trigger Background Task
    background_tasks.add_task(
        process_extraction_job,
        new_job.id,
        urls,
        disease,
        stage,
        keywords,
        max_facts
    )

    return {
        "status": "Job Started",
        "job_id": new_job.id,
        "urls_detected": len(urls)
    }

@router.get("/job/{job_id}")
def check_status(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    facts = db.query(Fact).filter(Fact.job_id == job_id).all()
    
    return {
        "job_id": job.id,
        "status": job.status,
        "disease": job.disease,
        "facts_found": len(facts),
        "facts": [{"text": f.fact_text, "source": f.source_url} for f in facts]
    }