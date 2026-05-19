import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
from typing import Dict, List, Any
import numpy as np
from app.config import settings

class DocumentAIModel:
    """PyTorch-based document processing using Hugging Face models"""
    
    def __init__(self):
        self.device = torch.device(settings.DEVICE)
        self.embedding_model = None
        self.finbert_model = None
        self.finbert_tokenizer = None
        self._load_models()
    
    def _load_models(self):
        """Load pretrained models from Hugging Face"""
        print(f"Loading models on {self.device}...")
        
        # Sentence Transformer for embeddings
        self.embedding_model = SentenceTransformer(
            settings.EMBEDDING_MODEL,
            device=settings.DEVICE
        )
        
        # FinBERT for financial text analysis
        self.finbert_tokenizer = AutoTokenizer.from_pretrained(
            settings.FINBERT_MODEL
        )
        self.finbert_model = AutoModelForSequenceClassification.from_pretrained(
            settings.FINBERT_MODEL
        ).to(self.device)
        
        print("Models loaded successfully!")
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for text using PyTorch"""
        with torch.no_grad():
            embeddings = self.embedding_model.encode(
                texts,
                convert_to_numpy=True,
                show_progress_bar=False
            )
        return embeddings
    
    def analyze_financial_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze financial text sentiment using FinBERT"""
        inputs = self.finbert_tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512
        ).to(self.device)
        
        with torch.no_grad():
            outputs = self.finbert_model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
        # FinBERT labels: positive, negative, neutral
        labels = ["positive", "negative", "neutral"]
        scores = predictions[0].cpu().numpy()
        
        return {
            "sentiment": labels[scores.argmax()],
            "confidence": float(scores.max()),
            "scores": {
                label: float(score)
                for label, score in zip(labels, scores)
            }
        }

# Singleton instance
document_ai = DocumentAIModel()