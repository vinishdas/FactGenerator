from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from app.models.fact_models import Fact

# Load the model ONCE when this file is imported.
# This prevents reloading it 100 times for 100 URLs.
print("Loading Vector Model (all-MiniLM-L6-v2)...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')
print("Vector Model Ready.")

def get_embedding(text: str) -> list[float]:
    """
    Converts text into a 384-dimensional vector list.
    """
    try:
        # encode returns a numpy array, we convert to list for DB
        return embedder.encode(text).tolist()
    except Exception as e:
        print(f"Vector Error: {e}")
        return []

def is_duplicate(db: Session, stage_id: int, vector: list[float], threshold: float = 0.15) -> bool:
    """
    Checks if a similar fact exists globally for this specific STAGE.
    """
    existing_fact = db.query(Fact).filter(
        # CRITICAL CHANGE: Check against the Stage ID, not Job ID
        Fact.stage_id == stage_id,
        Fact.embedding.cosine_distance(vector) < threshold
    ).first()
    
    return existing_fact is not None