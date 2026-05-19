from fastapi import APIRouter, Query, HTTPException
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

from app.services.search_service import search_service
from app.services.rag_service import rag_service
from app.agents.retrieval_agent import retrieval_agent
from app.services.vector_store import vector_store

router = APIRouter()

class SearchQuery(BaseModel):
    query: str
    customer_id: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    top_k: int = 10

class RAGQuery(BaseModel):
    query: str
    customer_id: Optional[str] = None
    use_agent: bool = True

@router.post("/semantic")
async def semantic_search(search_query: SearchQuery) -> Dict[str, Any]:
    """Perform semantic search"""
    try:
        results = await search_service.search_by_natural_language(
            query=search_query.query,
            top_k=search_query.top_k
        )
        return results
    except Exception as e:
        raise HTTPException(500, f"Search failed: {str(e)}")

@router.post("/rag")
async def rag_query(rag_query: RAGQuery) -> Dict[str, Any]:
    """RAG-based query with context retrieval"""
    try:
        if rag_query.use_agent:
            # Use LangGraph agent for intelligent retrieval
            result = await retrieval_agent.run(
                query=rag_query.query,
                customer_id=rag_query.customer_id
            )
        else:
            # Use direct RAG
            result = await rag_service.answer_with_rag(
                query=rag_query.query,
                customer_id=rag_query.customer_id
            )
        return result
    except Exception as e:
        raise HTTPException(500, f"RAG query failed: {str(e)}")

@router.get("/similar-customers/{customer_id}")
async def find_similar_customers(
    customer_id: str,
    top_k: int = Query(default=5, le=20)
) -> Dict[str, Any]:
    """Find customers with similar financial profiles"""
    try:
        similar = await search_service.find_similar_customers(
            customer_id=customer_id,
            top_k=top_k
        )
        return {
            "customer_id": customer_id,
            "similar_customers": similar,
            "count": len(similar)
        }
    except Exception as e:
        raise HTTPException(500, f"Similarity search failed: {str(e)}")

@router.post("/financial-filter")
async def search_with_financial_filters(
    query: str,
    min_salary: Optional[float] = None,
    max_salary: Optional[float] = None,
    employer: Optional[str] = None,
    income_stability: Optional[str] = None
) -> Dict[str, Any]:
    """Search with financial-specific filters"""
    try:
        results = await search_service.search_with_financial_filters(
            query=query,
            min_salary=min_salary,
            max_salary=max_salary,
            employer=employer,
            income_stability=income_stability
        )
        return {
            "query": query,
            "filters": {
                "min_salary": min_salary,
                "max_salary": max_salary,
                "employer": employer,
                "income_stability": income_stability
            },
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(500, f"Filtered search failed: {str(e)}")

@router.get("/stats")
async def get_search_stats() -> Dict[str, Any]:
    """Get vector store statistics"""
    try:
        stats = await vector_store.get_collection_stats()
        return stats
    except Exception as e:
        raise HTTPException(500, f"Failed to get stats: {str(e)}")

@router.post("/deduplicate")
async def deduplicate_documents(texts: List[str]) -> Dict[str, Any]:
    """Remove semantically duplicate documents"""
    try:
        unique_texts = await search_service.semantic_deduplication(texts)
        return {
            "original_count": len(texts),
            "unique_count": len(unique_texts),
            "duplicates_removed": len(texts) - len(unique_texts),
            "unique_texts": unique_texts
        }
    except Exception as e:
        raise HTTPException(500, f"Deduplication failed: {str(e)}")