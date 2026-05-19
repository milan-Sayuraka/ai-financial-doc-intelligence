import chromadb
from chromadb.config import Settings as ChromaSettings
from chromadb.utils import embedding_functions
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

from app.config import settings
from app.models.document_ai import document_ai

class VectorStoreService:
    """ChromaDB vector store for document embeddings"""
    
    def __init__(self):
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_DB_PATH,
            settings=ChromaSettings(
                anonymized_telemetry=False
            )
        )
        
        # Custom embedding function using our PyTorch model
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=settings.EMBEDDING_MODEL,
            device=settings.DEVICE
        )
        
        # Collections
        self.document_collection = self._get_or_create_collection(
            "financial_documents",
            "Collection for financial documents"
        )
        
        self.customer_collection = self._get_or_create_collection(
            "customer_profiles",
            "Collection for customer financial profiles"
        )
        
        self.policy_collection = self._get_or_create_collection(
            "loan_policies",
            "Collection for loan policies and rules"
        )
    
    def _get_or_create_collection(self, name: str, description: str):
        """Get or create a ChromaDB collection"""
        try:
            return self.client.get_collection(
                name=name,
                embedding_function=self.embedding_function
            )
        except:
            return self.client.create_collection(
                name=name,
                embedding_function=self.embedding_function,
                metadata={"description": description}
            )
    
    async def add_document(
        self,
        text: str,
        metadata: Dict[str, Any],
        document_id: Optional[str] = None
    ) -> str:
        """Add document to vector store"""
        doc_id = document_id or str(uuid.uuid4())
        
        # Generate embedding and add to collection
        self.document_collection.add(
            documents=[text],
            metadatas=[{
                **metadata,
                "stored_at": datetime.now().isoformat()
            }],
            ids=[doc_id]
        )
        
        return doc_id
    
    async def add_customer_profile(
        self,
        customer_id: str,
        profile_text: str,
        metadata: Dict[str, Any]
    ) -> str:
        """Add customer profile to vector store"""
        self.customer_collection.add(
            documents=[profile_text],
            metadatas=[{
                **metadata,
                "customer_id": customer_id,
                "updated_at": datetime.now().isoformat()
            }],
            ids=[customer_id]
        )
        
        return customer_id
    
    async def semantic_search(
        self,
        query: str,
        collection_name: str = "financial_documents",
        n_results: int = 5
    ) -> List[Dict[str, Any]]:
        """Perform semantic search using embeddings"""
        collection = getattr(self, f"{collection_name}_collection")
        
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )
        
        # Format results
        formatted_results = []
        if results["documents"] and results["documents"][0]:
            for i in range(len(results["documents"][0])):
                formatted_results.append({
                    "content": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "relevance_score": 1 - results["distances"][0][i] if results["distances"] else 0,
                })
        
        return formatted_results
    
    async def hybrid_search(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        n_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Hybrid search: semantic + metadata filtering"""
        where_filter = None
        if filters:
            where_filter = {}
            for key, value in filters.items():
                if isinstance(value, list):
                    where_filter[key] = {"$in": value}
                elif isinstance(value, dict) and "$gte" in value:
                    where_filter[key] = value
                else:
                    where_filter[key] = value
        
        # Search across multiple collections
        doc_results = self.document_collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_filter,
            include=["documents", "metadatas", "distances"]
        )
        
        customer_results = self.customer_collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_filter,
            include=["documents", "metadatas", "distances"]
        )
        
        # Merge and rank results
        all_results = []
        
        if doc_results["documents"] and doc_results["documents"][0]:
            for i in range(len(doc_results["documents"][0])):
                all_results.append({
                    "content": doc_results["documents"][0][i],
                    "metadata": doc_results["metadatas"][0][i] if doc_results["metadatas"] else {},
                    "relevance_score": 1 - doc_results["distances"][0][i] if doc_results["distances"] else 0,
                    "source": "documents"
                })
        
        if customer_results["documents"] and customer_results["documents"][0]:
            for i in range(len(customer_results["documents"][0])):
                all_results.append({
                    "content": customer_results["documents"][0][i],
                    "metadata": customer_results["metadatas"][0][i] if customer_results["metadatas"] else {},
                    "relevance_score": 1 - customer_results["distances"][0][i] if customer_results["distances"] else 0,
                    "source": "customers"
                })
        
        # Sort by relevance
        all_results.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return all_results[:n_results]
    
    async def delete_document(self, document_id: str):
        """Delete document from vector store"""
        self.document_collection.delete(ids=[document_id])
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about all collections"""
        return {
            "documents_count": self.document_collection.count(),
            "customers_count": self.customer_collection.count(),
            "policies_count": self.policy_collection.count()
        }

# Singleton
vector_store = VectorStoreService()