from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any, List
import os
import shutil
from datetime import datetime

from app.config import settings
from app.services.ocr_service import OCRService
from app.models.document_ai import document_ai

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    customer_id: str = None
) -> Dict[str, Any]:
    """Upload and process a financial document"""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Invalid file type")
    
    # Save file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text using OCR
    if file.content_type == "application/pdf":
        texts = await OCRService.extract_from_pdf(file_path)
        full_text = "\n".join(texts)
    else:
        full_text = await OCRService.extract_from_image(file_path)
    
    # Extract financial information
    financial_info = await OCRService.extract_financial_info(full_text)
    
    # Analyze with FinBERT
    sentiment = document_ai.analyze_financial_sentiment(full_text)
    
    # Generate embeddings for semantic search
    embeddings = document_ai.generate_embeddings([full_text])
    
    # Combine results
    result = {
        "document_id": timestamp,
        "filename": filename,
        "extracted_data": financial_info["extracted_data"],
        "sentiment_analysis": sentiment,
        "customer_id": customer_id,
        "processed_at": datetime.now().isoformat()
    }
    
    return result

@router.post("/batch-process")
async def batch_process(files: List[UploadFile] = File(...)):
    """Process multiple documents"""
    results = []
    for file in files:
        result = await upload_document(file)
        results.append(result)
    return {"processed": len(results), "results": results}