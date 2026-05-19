from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
import json

from app.services.rag_service import rag_service
from app.services.search_service import search_service
from app.services.vector_store import vector_store
from app.models.document_ai import document_ai

class RetrievalState(TypedDict):
    """State for the retrieval agent graph"""
    query: str
    customer_id: Optional[str]
    filters: Optional[Dict[str, Any]]
    retrieved_docs: List[Dict[str, Any]]
    analysis: Dict[str, Any]
    response: Dict[str, Any]
    next_step: str

class RetrievalAgent:
    """LangGraph agent for intelligent document retrieval"""
    
    def __init__(self):
        self.graph = self._build_graph()
    
    def _build_graph(self):
        """Build the LangGraph workflow"""
        workflow = StateGraph(RetrievalState)
        
        # Add nodes
        workflow.add_node("analyze_query", self.analyze_query)
        workflow.add_node("retrieve_documents", self.retrieve_documents)
        workflow.add_node("analyze_results", self.analyze_results)
        workflow.add_node("refine_search", self.refine_search)
        workflow.add_node("format_response", self.format_response)
        
        # Add edges
        workflow.set_entry_point("analyze_query")
        workflow.add_conditional_edges(
            "analyze_query",
            self.should_retrieve,
            {
                "retrieve": "retrieve_documents",
                "format": "format_response"
            }
        )
        workflow.add_edge("retrieve_documents", "analyze_results")
        workflow.add_conditional_edges(
            "analyze_results",
            self.should_refine,
            {
                "refine": "refine_search",
                "format": "format_response"
            }
        )
        workflow.add_edge("refine_search", "retrieve_documents")
        workflow.add_edge("format_response", END)
        
        return workflow.compile()
    
    async def analyze_query(self, state: RetrievalState) -> RetrievalState:
        """Analyze the query to determine search strategy"""
        query = state["query"]
        
        # Determine query type
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["unstable", "risky", "risk"]):
            state["filters"] = {"income_stability": "Variable"}
        elif any(word in query_lower for word in ["high income", "high salary"]):
            state["filters"] = {"salary": {"$gte": 100000}}
        elif any(word in query_lower for word in ["stable", "consistent"]):
            state["filters"] = {"income_stability": "Stable"}
        
        state["next_step"] = "retrieve"
        return state
    
    def should_retrieve(self, state: RetrievalState) -> str:
        """Determine if retrieval is needed"""
        if state["query"].strip():
            return "retrieve"
        return "format"
    
    async def retrieve_documents(self, state: RetrievalState) -> RetrievalState:
        """Retrieve relevant documents"""
        results = await search_service.search_by_natural_language(
            query=state["query"]
        )
        
        state["retrieved_docs"] = results["top_results"]
        return state
    
    async def analyze_results(self, state: RetrievalState) -> RetrievalState:
        """Analyze retrieved documents"""
        if not state["retrieved_docs"]:
            state["analysis"] = {"quality": "no_results"}
            return state
        
        # Analyze relevance and completeness
        relevance_scores = [
            doc.get("relevance_score", 0)
            for doc in state["retrieved_docs"]
        ]
        
        avg_relevance = sum(relevance_scores) / len(relevance_scores)
        
        state["analysis"] = {
            "quality": "good" if avg_relevance > 0.7 else "needs_refinement",
            "average_relevance": avg_relevance,
            "num_results": len(state["retrieved_docs"])
        }
        
        return state
    
    def should_refine(self, state: RetrievalState) -> str:
        """Determine if search needs refinement"""
        if state["analysis"]["quality"] == "needs_refinement":
            return "refine"
        return "format"
    
    async def refine_search(self, state: RetrievalState) -> RetrievalState:
        """Refine the search query"""
        # Use sentiment analysis to refine
        sentiment = document_ai.analyze_financial_sentiment(state["query"])
        
        if sentiment["sentiment"] == "positive":
            state["filters"] = state.get("filters", {})
            state["filters"]["financial_risk"] = "Low"
        elif sentiment["sentiment"] == "negative":
            state["filters"] = state.get("filters", {})
            state["filters"]["financial_risk"] = "High"
        
        return state
    
    async def format_response(self, state: RetrievalState) -> RetrievalState:
        """Format the final response"""
        state["response"] = {
            "query": state["query"],
            "results": state["retrieved_docs"],
            "analysis": state["analysis"],
            "filters_applied": state.get("filters"),
            "result_count": len(state["retrieved_docs"])
        }
        return state
    
    async def run(self, query: str, customer_id: Optional[str] = None) -> Dict[str, Any]:
        """Run the retrieval agent"""
        initial_state = {
            "query": query,
            "customer_id": customer_id,
            "filters": None,
            "retrieved_docs": [],
            "analysis": {},
            "response": {},
            "next_step": "analyze_query"
        }
        
        final_state = await self.graph.ainvoke(initial_state)
        return final_state["response"]

# Singleton
retrieval_agent = RetrievalAgent()