from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine, Base
# ADD COMPLIANCE HERE
from app.routers import fact_generator, ontology, compliance 
from fastapi.middleware.cors import CORSMiddleware

with engine.connect() as connection:
    connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    connection.commit()

# --- DATABASE SETUP ---
Base.metadata.create_all(bind=engine)

# --- APP INITIALIZATION ---
app = FastAPI(
    title="Clinical Fact Extraction Engine",
    description="A High-Fidelity, Local-First Medical Knowledge Extraction System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = False,
    allow_headers = ["*"],
    allow_methods=["*"]
)

# --- ROUTER REGISTRATION ---
app.include_router(fact_generator.router)
app.include_router(ontology.router)
# REGISTER ROUTER HERE
app.include_router(compliance.router)

@app.get("/")
def health_check():
    return {
        "status": "System Online",
        "module": "FactGenerator",
        "database": "Connected",
        "version": "1.0.0"
    }