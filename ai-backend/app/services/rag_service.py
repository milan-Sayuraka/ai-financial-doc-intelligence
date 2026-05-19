from typing import Dict, Any, List, Optional
import json

from app.services.vector_store import vector_store
from app.models.document_ai import document_ai
from app.config import settings

class RAGService:
    """Retrieval-Augmented Generation service"""
    
    def __init__(self):
        self.vector_store = vector_store
        self.document_ai = document_ai
    
    async def retrieve_context(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant context for a query"""
        results = await self.vector_store.hybrid_search(
            query=query,
            filters=filters,
            n_results=top_k
        )
        
        return results
    
    async def build_prompt(
        self,
        query: str,
        context: List[Dict[str, Any]],
        system_prompt: str = ""
    ) -> str:
        """Build a prompt with retrieved context for LLM"""
        
        if not system_prompt:
            system_prompt = """You are a GMC financial assistant. 
            Use the provided context to answer questions accurately.
            If the context doesn't contain enough information, say so.
            Always prioritize financial accuracy and regulatory compliance."""
        
        # Format context
        context_text = "\n\n".join([
            f"Document {i+1}:\nSource: {item.get('source', 'unknown')}\n"
            f"Content: {item['content']}\n"
            f"Relevance: {item['relevance_score']:.2f}"
            for i, item in enumerate(context)
        ])
        
        prompt = f"""{system_prompt}

Context Information:
{context_text}

User Question: {query}

Based on the context above, provide a detailed and accurate response:"""
        
        return prompt
    
    async def answer_with_rag(
        self,
        query: str,
        customer_id: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Complete RAG pipeline: retrieve + generate answer"""
        
        # Add customer filter if provided
        if customer_id and not filters:
            filters = {}
        if customer_id:
            filters["customer_id"] = customer_id
        
        # Step 1: Retrieve relevant context
        context = await self.retrieve_context(query, filters)
        
        # Step 2: Analyze retrieved context sentiment
        context_analysis = []
        for item in context:
            sentiment = self.document_ai.analyze_financial_sentiment(
                item["content"]
            )
            context_analysis.append({
                "content_preview": item["content"][:200],
                "sentiment": sentiment["sentiment"],
                "confidence": sentiment["confidence"]
            })
        
        # Step 3: Build prompt with context
        prompt = await self.build_prompt(query, context)
        
        # Step 4: Structure the response
        response = {
            "query": query,
            "retrieved_context": [
                {
                    "source": item.get("source", "unknown"),
                    "relevance": item.get("relevance_score", 0),
                    "preview": item["content"][:150] + "..."
                }
                for item in context
            ],
            "context_analysis": context_analysis,
            "prompt_for_llm": prompt,
            "metadata": {
                "num_documents_retrieved": len(context),
                "filters_applied": filters
            }
        }
        
        return response
    
    async def analyze_customer_financials(
        self,
        customer_id: str
    ) -> Dict[str, Any]:
        """Analyze customer financial profile using RAG"""
        
        # Retrieve all customer documents
        context = await self.vector_store.hybrid_search(
            query=f"customer {customer_id} financial documents",
            filters={"customer_id": customer_id},
            n_results=20
        )
        
        # Extract financial metrics
        salary_info = []
        employers = []
        total_income = 0
        
        for item in context:
            content = item["content"]
            
            # Extract salary information
            import re
            salary_match = re.search(
                r'(?:Rs\.?|INR)?\s*([\d,]+)\s*(?:per\s*month|monthly|p\.m\.?)',
                content,
                re.IGNORECASE
            )
            if salary_match:
                salary = float(salary_match.group(1).replace(',', ''))
                salary_info.append(salary)
                total_income += salary
            
            # Extract employer
            employer_match = re.search(
                r'(?:employer|company)\s*(?::|is|name)?\s*([A-Za-z\s&.]+?)(?:\n|,|\.)',
                content,
                re.IGNORECASE
            )
            if employer_match:
                employers.append(employer_match.group(1).strip())
        
        # Calculate financial stability
        avg_salary = sum(salary_info) / len(salary_info) if salary_info else 0
        salary_variance = sum(
            (s - avg_salary) ** 2 for s in salary_info
        ) / len(salary_info) if salary_info else 0
        
        stability = "Stable" if salary_variance < (avg_salary * 0.1) else "Variable"
        
        return {
            "customer_id": customer_id,
            "financial_summary": {
                "average_monthly_salary": avg_salary,
                "total_documented_income": total_income,
                "salary_stability": stability,
                "employers": list(set(employers)),
                "num_documents_analyzed": len(context)
            },
            "raw_context_count": len(context)
        }

# Singleton
rag_service = RAGService()