# app/routers/compliance.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
# Import Fact to find URLs, and Stage/ComplianceResult for linking
from app.models.fact_models import ComplianceResult, Stage, Fact 
from app.services.compliance import check_compliance_for_url

router = APIRouter(prefix="/compliance", tags=["Singapore Compliance"])

# --- Schemas ---
class ComplianceRequest(BaseModel):
    url: str
    stage_id: int

class ComplianceLogSchema(BaseModel):
    id: int
    url: str
    tag: str         # "PASS" or "FAIL"
    reason: str
    stage_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- 1. BATCH SCAN: Extract Compliance for ALL URLs in a Stage ---
@router.post("/stage/{stage_id}/scan", response_model=List[ComplianceLogSchema])
def scan_stage_compliance(stage_id: int, db: Session = Depends(get_db)):
    """
    1. Finds all unique URLs extracted for this Stage (from the Facts table).
    2. Runs the SG Compliance Checker on each URL.
    3. Saves/Updates the PASS/FAIL status in the Compliance table.
    4. Returns the list of results.
    """
    # A. Verify Stage exists
    stage = db.query(Stage).filter(Stage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Stage ID not found")

    # B. Find all unique URLs for this stage from the Fact table
    # We use distinct() to avoid checking the same URL multiple times
    urls = db.query(Fact.source_url).filter(
        Fact.stage_id == stage_id,
        Fact.source_url.isnot(None)
    ).distinct().all()

    unique_urls = [u[0] for u in urls if u[0]] # Clean list

    if not unique_urls:
        return []

    results = []

    # C. Run Checks
    for url in unique_urls:
        # 1. Run Algorithm
        check_data = check_compliance_for_url(url)
        
        # 2. Save Result (Update if exists, or Create new)
        # Check if we already have a log for this URL+Stage to avoid duplicates
        existing_log = db.query(ComplianceResult).filter(
            ComplianceResult.url == url,
            ComplianceResult.stage_id == stage_id
        ).first()

        if existing_log:
            # Update existing
            existing_log.status = check_data["status"]
            existing_log.reason = check_data["reason"]
            existing_log.created_at = datetime.utcnow()
            db.add(existing_log)
            db.commit()
            db.refresh(existing_log)
            results.append(existing_log)
        else:
            # Create new
            new_log = ComplianceResult(
                url=url,
                status=check_data["status"],
                reason=check_data["reason"],
                stage_id=stage_id
            )
            db.add(new_log)
            db.commit()
            db.refresh(new_log)
            results.append(new_log)
            
    return   [
        ComplianceLogSchema(
            id=log.id,
            url=log.url,
            tag=log.status,        # Map 'status' to 'tag'
            reason=log.reason,
            stage_id=log.stage_id,
            timestamp=log.created_at # Map 'created_at' to 'timestamp'
        )
        for log in results
    ]

# --- 2. GET: Retrieve Compliance Logs for a Stage ---
@router.get("/stage/{stage_id}", response_model=List[ComplianceLogSchema])
def get_stage_compliance_logs(stage_id: int, db: Session = Depends(get_db)):
    """
    Now the primary route. Shows data automatically generated during fact extraction.
    """
    logs = db.query(ComplianceResult).filter(
        ComplianceResult.stage_id == stage_id
    ).order_by(ComplianceResult.created_at.desc()).all()
    
    return [
        ComplianceLogSchema(
            id=log.id,
            url=log.url,
            tag=log.status,
            reason=log.reason,
            stage_id=log.stage_id,
            timestamp=log.created_at
        )
        for log in logs
    ]
# --- 3. SINGLE CHECK: Manual Entry (Existing) ---
@router.post("/check")
def check_manual_url(request: ComplianceRequest, db: Session = Depends(get_db)):
    """
    Manually check a specific URL and link it to a stage.
    """
    stage = db.query(Stage).filter(Stage.id == request.stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Stage ID not found")

    result = check_compliance_for_url(request.url)
    
    db_entry = ComplianceResult(
        url=request.url,
        status=result["status"],
        reason=result["reason"],
        stage_id=request.stage_id
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return {
        "url": request.url,
        "tag": result["status"],
        "reason": result["reason"],
        "check_id": db_entry.id
    }