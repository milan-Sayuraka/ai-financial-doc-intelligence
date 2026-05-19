from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App
    APP_NAME: str = "GMC AI Assistant"
    DEBUG: bool = True
    
    # MongoDB
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb+srv://jayangajanu_db_user:OzPGEWAzfXUbMljo@cluster0.crgnji9.mongodb.net")
    MONGODB_DB: str = os.getenv("MONGODB_DB", "gmc_financial")
    
    # Hugging Face
    HF_TOKEN: Optional[str] = os.getenv("HF_TOKEN", None)
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    FINBERT_MODEL: str = "ProsusAI/finbert"
    
    # Models
    DEVICE: str = "cpu"  # or "cuda" if GPU available
    
    # Paths
    UPLOAD_DIR: str = "uploads"
    CHROMA_DB_PATH: str = "chroma_db"
    
    class Config:
        env_file = ".env"

settings = Settings()