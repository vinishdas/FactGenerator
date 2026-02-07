from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import relationship, mapped_column
# from pgvector.sqlalchemy import Vector
from datetime import datetime
from app.database import Base
from datetime import datetime

# --- NEW TABLE: DISEASE ---
#Acts as the source of truth for the dropdown menu.


class Disease(Base):
    __tablename__ = "diseases"
    
    id = Column(Integer, primary_key=True, index=True)
    # Name must be unique so we don't get "flu" and "Flu" in dropdowns
    name = Column(String, unique=True, nullable=False) 
    
    # Relationship: One disease has many stages
    stages = relationship("Stage", back_populates="disease")

# --- NEW TABLE: STAGE ---
# Links specific stages to specific diseases.
class Stage(Base):
    __tablename__ = "stages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    disease_id = Column(Integer, ForeignKey("diseases.id"), nullable=False)
    
    # Relationship: Belongs to one disease
    disease = relationship("Disease", back_populates="stages")
    # Relationship: One stage holds many facts
    facts = relationship("Fact", back_populates="stage")

    compliance_results = relationship("ComplianceResult", back_populates="stage") 
    
    __table_args__ = (
        UniqueConstraint('name', 'disease_id', name='_stage_disease_uc'),
    )

# --- MODIFIED TABLE: JOB ---
class ComplianceResult(Base):
    __tablename__ = "compliance_results"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    status = Column(String)  # "PASS" or "FAIL"
    reason = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # NEW: Link to Stage
    stage_id = Column(Integer, ForeignKey("stages.id"), nullable=False)
    stage = relationship("Stage", back_populates="compliance_results")
# Keeps track of the execution batch for audit history.
class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="PROCESSING")
    # We still keep disease/stage string names here just for easy log reading,
    # but they aren't the source of truth anymore.
    disease_name_log = Column(String)
    stage_name_log = Column(String)
    total_urls = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- MODIFIED TABLE: FACT ---
# Now links to a permanent STAGE, not just a temporary JOB.
class Fact(Base):
    __tablename__ = "facts"
    
    id = Column(Integer, primary_key=True)
    
    # --- CRITICAL CHANGES ---
    # 1. Link to the permanent Stage structure
    stage_id = Column(Integer, ForeignKey("stages.id"), nullable=False)
    
    # 2. Keep job_id just to know which batch created it (optional audit trail)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)

    fact_text = Column(Text, nullable=False)
    source_url = Column(String)
    # embedding = mapped_column(Vector(384))
    
    # Status for the Auditing Interface (Pending/Approved/Rejected)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    stage = relationship("Stage", back_populates="facts")
    job = relationship("Job")