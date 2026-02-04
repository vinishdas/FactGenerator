from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
# Import the new models
from app.models.fact_models import Disease, Stage, Fact

router = APIRouter(prefix="/ontology", tags=["Ontology (Diseases & Stages)"])

# --- 1. Get all Diseases (For Dropdown 1) ---
@router.get("/diseases")
def get_all_diseases(db: Session = Depends(get_db)):
    """Returns a list of all diseases present in the database."""
    diseases = db.query(Disease).order_by(Disease.name).all()
    return [{"id": d.id, "name": d.name} for d in diseases]

# --- 2. Get Stages for a specific Disease (For Dropdown 2 / Card Click 1) ---
@router.get("/diseases/{disease_id}/stages")
def get_stages_for_disease(disease_id: int, db: Session = Depends(get_db)):
    """Returns stages related to a specific disease ID."""
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
        
    stages = db.query(Stage).filter(Stage.disease_id == disease_id).order_by(Stage.name).all()
    return [{"id": s.id, "name": s.name, "disease_name": disease.name} for s in stages]

# --- 3. Get Facts for a Stage (For Auditing Interface / Card Click 2) ---
@router.get("/stages/{stage_id}/facts")
def get_facts_for_stage(stage_id: int, status: str = "all", db: Session = Depends(get_db)):
    """
    Returns all facts linked to a specific stage ID.
    Optional query param 'status' can filter by 'PENDING', 'APPROVED', etc.
    """
    stage = db.query(Stage).filter(Stage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    query = db.query(Fact).filter(Fact.stage_id == stage_id)
    
    if status.lower() != "all":
        query = query.filter(Fact.status == status.upper())
        
    facts = query.order_by(Fact.created_at.desc()).all()
    
    return {
        "disease": stage.disease.name,
        "stage": stage.name,
        "count": len(facts),
        "facts": [
            {
                "id": f.id, 
                "text": f.fact_text, 
                "source": f.source_url, 
                "status": f.status,
                "created_at": f.created_at
            } for f in facts
        ]
    }