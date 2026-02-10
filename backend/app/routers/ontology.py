from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
# Import the new models
from app.models.fact_models import Disease, Stage, Fact
from pydantic import BaseModel


router = APIRouter(prefix="/ontology", tags=["Ontology (Diseases & Stages)"])
class StatusUpdate(BaseModel):
    status: str # "APPROVED" or "REJECTED"
class DiseaseCreate(BaseModel):
    name: str
class StageCreate(BaseModel):
    name: str
    disease_id: int

@router.patch("/facts/{fact_id}/status")
def update_fact_status(fact_id: int, update: StatusUpdate, db: Session = Depends(get_db)):
    fact = db.query(Fact).filter(Fact.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    fact.status = update.status.upper()
    db.commit()
    return {"message": f"Fact {fact_id} marked as {fact.status}"}


@router.post("/diseases")
def create_disease(disease: DiseaseCreate, db: Session = Depends(get_db)):
    """
    Manually creates a new disease entry in the database.
    Checks for duplicates before creating.
    """
    # 1. Clean the input
    clean_name = disease.name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Disease name cannot be empty")

    # 2. Check if it already exists
    existing_disease = db.query(Disease).filter(Disease.name == clean_name).first()
    if existing_disease:
        raise HTTPException(status_code=400, detail=f"Disease '{clean_name}' already exists.")

    # 3. Create and Save
    new_disease = Disease(name=clean_name)
    db.add(new_disease)
    db.commit()
    db.refresh(new_disease)
    
    return {
        "id": new_disease.id, 
        "name": new_disease.name, 
        "message": "Successfully created new disease."
    }


# --- Create a New Stage (Manual Entry) ---
@router.post("/stages")
def create_stage(stage: StageCreate, db: Session = Depends(get_db)):
    """
    Manually creates a new stage entry linked to a specific disease.
    Checks if the parent disease exists and if the stage is a duplicate.
    """
    # 1. Clean the input
    clean_name = stage.name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Stage name cannot be empty")

    # 2. Check if the Parent Disease exists
    # We cannot create a stage for a disease that doesn't exist.
    disease = db.query(Disease).filter(Disease.id == stage.disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail=f"Parent Disease (ID {stage.disease_id}) not found.")

    # 3. Check for duplicates
    # We check if THIS stage name already exists for THIS disease.
    # (It is okay to have "Stage 1" for Cancer AND "Stage 1" for Kidney Disease, but not two for Cancer).
    existing_stage = db.query(Stage).filter(
        Stage.name == clean_name, 
        Stage.disease_id == stage.disease_id
    ).first()
    
    if existing_stage:
        raise HTTPException(
            status_code=400, 
            detail=f"Stage '{clean_name}' already exists for disease '{disease.name}'."
        )

    # 4. Create and Save
    new_stage = Stage(name=clean_name, disease_id=stage.disease_id)
    db.add(new_stage)
    db.commit()
    db.refresh(new_stage)
    
    return {
        "id": new_stage.id, 
        "name": new_stage.name, 
        "disease_id": new_stage.disease_id,
        "message": f"Successfully created stage '{new_stage.name}' for {disease.name}."
    }

# --- 1. Get all Diseases (For Dropdown 1) ---
@router.get("/diseases")
def get_all_diseases(db: Session = Depends(get_db)):
    """Returns a list of all diseases present in the database."""
    diseases = db.query(Disease).order_by(Disease.name).all()
    return [{"id": d.id, "name": d.name} for d in diseases]

# --- 2. Get Stages for a specific Disease (For Dropdown 2 / Card Click 1) ---
@router.get("/diseases/{disease_id}/stages")
def get_stages_for_disease(disease_id: int, db: Session = Depends(get_db)):
    """
    Returns stages related to a specific disease ID.
    Now includes a count of 'PENDING' facts for each stage.
    """
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
        
    stages = db.query(Stage).filter(Stage.disease_id == disease_id).order_by(Stage.name).all()
    
    result = []
    for s in stages:
        # Count facts where status is 'PENDING' for this stage
        pending_count = db.query(Fact).filter(
            Fact.stage_id == s.id, 
            Fact.status == "PENDING"
        ).count()
        
        result.append({
            "id": s.id, 
            "name": s.name, 
            "disease_name": disease.name,
            "pending_facts": pending_count
        })
        
    return result

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