from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.database import Base

class SingaporeCompliance(Base):
    __tablename__ = "singapore_compliance_results"

    # 1. Identity & Linkage
    # This ID is manually set to match the Parent Fact's ID (One-to-One Relationship)
    id = Column(Integer, ForeignKey("facts.id"), primary_key=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 2. Input
    url = Column(String, nullable=False, index=True)

    # 3. Verdict
    status = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)

    # 4. Evidence
    snippet = Column(Text, nullable=True)
    matched_keywords = Column(JSON, default={})

    # 5. Full Content
    full_text_content = Column(Text, nullable=True)

    # 6. AI Embeddings
    embedding = Column(Vector(384), nullable=True)

    # 7. Relationship to Parent
    # Ensure your Fact model has: compliance = relationship("SingaporeCompliance", uselist=False)
    fact = relationship("Fact")