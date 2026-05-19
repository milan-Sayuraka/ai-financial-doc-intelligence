import pytesseract
from PIL import Image
import pdf2image
from typing import Dict, Any, List
import os
from app.config import settings

class OCRService:
    """Extract text from documents using Tesseract OCR"""
    
    @staticmethod
    async def extract_from_image(image_path: str) -> str:
        """Extract text from image file"""
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text
    
    @staticmethod
    async def extract_from_pdf(pdf_path: str) -> List[str]:
        """Extract text from PDF file"""
        images = pdf2image.convert_from_path(pdf_path)
        texts = []
        for i, image in enumerate(images):
            text = pytesseract.image_to_string(image)
            texts.append(text)
        return texts
    
    @staticmethod
    async def extract_financial_info(text: str) -> Dict[str, Any]:
        """Extract financial information from text"""
        # This uses regex patterns to extract salary, employer, etc.
        import re
        
        info = {
            "raw_text": text,
            "extracted_data": {}
        }
        
        # Salary patterns (example - customize for your region)
        salary_patterns = [
            r'(?:salary|income|gross)\s*(?::|is|of|amount)?\s*(?:Rs\.?|INR)?\s*([\d,]+)',
            r'(?:Rs\.?|INR)?\s*([\d,]+)\s*(?:per\s*month|monthly|p\.m\.?)',
        ]
        
        for pattern in salary_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                salary_str = match.group(1).replace(',', '')
                info["extracted_data"]["salary"] = float(salary_str)
                break
        
        # Employer patterns
        employer_patterns = [
            r'(?:employer|company|organization)\s*(?::|is|name)?\s*([A-Za-z\s&.]+?)(?:\n|,|\.)',
            r'employed\s*(?:at|with|by)\s*([A-Za-z\s&.]+?)(?:\n|,|\.)',
        ]
        
        for pattern in employer_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info["extracted_data"]["employer"] = match.group(1).strip()
                break
        
        return info