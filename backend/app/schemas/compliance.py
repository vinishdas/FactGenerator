from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ScanRequest(BaseModel):
    url: str

class ScanResponse(BaseModel):
    url: str
    status: str
    confidence_score: float
    snippet: Optional[str] = None
    matched_keywords: Optional[Dict[str, Any]] = None
    full_text_content: Optional[str] = None
    embedding: Optional[List[float]] = None

    class Config:
        from_attributes = True
