"""
MedEase AI — FastAPI Main Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes.health import router as health_router
from app.routes.reports import router as reports_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Deterministic Medical Lab Report Explanation Platform"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under /api
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "message": "Welcome to MedEase AI Backend API",
        "tagline": "MedEase AI doesn't replace your doctor. It helps you understand your report before you meet one.",
        "docs_url": "/docs",
        "health_url": f"{settings.API_PREFIX}/health"
    }
