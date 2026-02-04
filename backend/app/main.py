from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine, Base
from app.routers import fact_generator,ontology
from fastapi.middleware.cors import CORSMiddleware



with engine.connect() as connection:
    connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    connection.commit()

# --- DATABASE SETUP ---
# This command looks at all your loaded models (in app/models/) 
# and creates the tables in Postgres if they don't exist yet.
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
# Connects your "Fact Generator" feature to the main app.
# You will add future features here (e.g., app.include_router(analysis.router))
app.include_router(fact_generator.router)

app.include_router(ontology.router)

# --- HEALTH CHECK ---
# A simple endpoint to verify the server is running.
@app.get("/")
def health_check():
    return {
        "status": "System Online",
        "module": "FactGenerator",
        "database": "Connected",
        "version": "1.0.0"
    }