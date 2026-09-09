"""
MedEase AI — Health Check Endpoint
"""

from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "demo_mode": settings.DEMO_MODE,
        "ai_provider": settings.AI_PROVIDER if not settings.DEMO_MODE else "mock_demo"
    }
