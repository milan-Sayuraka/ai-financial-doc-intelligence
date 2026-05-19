from typing import Dict, Any, List, Optional
from app.services.vector_store import vector_store
from app.models.document_ai import document_ai

class SearchService:
    """Advanced semantic search service"""
    
    def __init__(self):
        self.vector_store = vector_store
        self.document_ai = document_ai
    
    async def search_by_natural_language(
        self,
        query: str,
        top_k: int = 10
    ) -> Dict[str, Any]:
        """Natural language search across all documents"""
        
        # Generate query embedding
        query_embedding = self.document_ai.generate_embeddings([query])
        
        # Search across all collections
        results = await self.vector_store.hybrid_search(
            query=query,
            n_results=top_k
        )
        
        # Categorize results
        categorized = {
            "documents": [],
            "customers": [],
            "policies": []
        }
        
        for result in results:
            source = result.get("source", "documents")
            categorized[source].append(result)
        
        return {
            "query": query,
            "total_results": len(results),
            "categorized_results": categorized,
            "top_results": results[:5]
        }
    
    async def find_similar_customers(
        self,
        customer_id: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Find customers with similar financial profiles"""
        
        # Get target customer profile
        customer_docs = await self.vector_store.hybrid_search(
            query=f"customer {customer_id}",
            filters={"customer_id": customer_id},
            n_results=1
        )
        
        if not customer_docs:
            return []
        
        # Use the customer's profile to find similar ones
        target_content = customer_docs[0]["content"]
        
        similar = await self.vector_store.hybrid_search(
            query=target_content,
            n_results=top_k + 1  # +1 to account for the same customer
        )
        
        # Filter out the same customer
        similar_customers = [
            cust for cust in similar
            if cust.get("metadata", {}).get("customer_id") != customer_id
        ][:top_k]
        
        return similar_customers
    
    async def search_with_financial_filters(
        self,
        query: str,
        min_salary: Optional[float] = None,
        max_salary: Optional[float] = None,
        employer: Optional[str] = None,
        income_stability: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search with financial-specific filters"""
        
        filters = {}
        
        if min_salary or max_salary:
            salary_filter = {}
            if min_salary:
                salary_filter["$gte"] = min_salary
            if max_salary:
                salary_filter["$lte"] = max_salary
            if salary_filter:
                filters["salary"] = salary_filter
        
        if employer:
            filters["employer"] = employer
        
        if income_stability:
            filters["income_stability"] = income_stability
        
        results = await self.vector_store.hybrid_search(
            query=query,
            filters=filters if filters else None
        )
        
        return results
    
    async def semantic_deduplication(
        self,
        texts: List[str],
        threshold: float = 0.95
    ) -> List[str]:
        """Find and remove semantically duplicate documents"""
        
        if len(texts) <= 1:
            return texts
        
        # Generate embeddings
        embeddings = self.document_ai.generate_embeddings(texts)
        
        # Find duplicates using cosine similarity
        from sklearn.metrics.pairwise import cosine_similarity
        similarity_matrix = cosine_similarity(embeddings)
        
        duplicates = set()
        for i in range(len(texts)):
            for j in range(i + 1, len(texts)):
                if similarity_matrix[i][j] > threshold:
                    duplicates.add(j)  # Mark as duplicate
        
        # Return unique texts
        unique_texts = [
            text for i, text in enumerate(texts)
            if i not in duplicates
        ]
        
        return unique_texts

# Singleton
search_service = SearchService()