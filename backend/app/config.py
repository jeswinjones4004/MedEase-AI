import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    APP_NAME: str = "MedEase AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # AI and Demo mode configuration
    # Default to demo mode if no API key is provided
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini") # gemini, openai, or mock
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true" or not os.getenv("AI_API_KEY")
    
    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "15"))
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".png", ".jpg", ".jpeg"]
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
