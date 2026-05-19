from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import os
import shutil

from app.config import settings
from app.models.document_ai import document_ai
from app.services.ocr_service import OCRService
from app.routes import documents, chat, analysis, search

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="GMC AI Financial Document Intelligence Assistant"
)

# CORS middleware - Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    # Create necessary directories
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.CHROMA_DB_PATH, exist_ok=True)
    
    print(f"🚀 {settings.APP_NAME} started successfully!")
    print(f"📁 Upload directory: {os.path.abspath(settings.UPLOAD_DIR)}")
    print(f"💾 ChromaDB path: {os.path.abspath(settings.CHROMA_DB_PATH)}")
    print(f"🧠 Device: {settings.DEVICE}")
    print(f"📊 API Docs: http://localhost:8000/docs")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("👋 Shutting down GMC AI Assistant...")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "documents": "/api/documents",
            "chat": "/api/chat",
            "analysis": "/api/analysis",
            "search": "/api/search"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": document_ai.embedding_model is not None,
        "device": settings.DEVICE
    }