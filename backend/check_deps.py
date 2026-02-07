import fastapi
import ollama
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str

print(f"FastAPI version: {fastapi.__version__}")
try:
    app = fastapi.FastAPI()
    print("FastAPI app created successfully")
except Exception as e:
    print(f"FastAPI creation failed: {e}")

print("Ollama imported successfully")
