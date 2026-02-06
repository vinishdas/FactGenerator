from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.compliance import ScanRequest, ScanResponse
from app.services.compliance_engine import ComplianceScanner

# Define the router
router = APIRouter(
    prefix="/compliance",
    tags=["Singapore Compliance"]
)

@router.post("/scan", response_model=ScanResponse)
def scan_website(payload: ScanRequest, db: Session = Depends(get_db)):
    """
    Scans a URL for Singapore Compliance violations.
    """
    try:
        # Calls the robust engine we created earlier
        result = ComplianceScanner.process_url(db, payload.url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))