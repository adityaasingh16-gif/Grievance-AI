from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

from classifier import classify_text, get_embedding
from priority import score_priority
from entities import extract_entities
from vector_store import find_similar, add_to_index, get_index_stats
from summarizer import summarize_text
from rag_assistant import rag_query

app = FastAPI(title="GrievanceAI ML Service", version="1.0.0")

class TextRequest(BaseModel):
    text: str

class ClassifyResponse(BaseModel):
    category: str
    department: str
    subcategory: Optional[str]
    confidence: float
    keywords: List[str]
    language: str

class PriorityResponse(BaseModel):
    priority: str
    score: int
    reasoning: str

class SimilarRequest(BaseModel):
    text: str
    grievanceId: Optional[str] = None
    topK: int = 5

class RAGRequest(BaseModel):
    question: str
    department: Optional[str] = None

@app.get("/health")
async def health():
    return {
        "status": "ok", 
        "service": "ml-service", 
        "index_stats": get_index_stats()
    }

@app.post("/embed")
async def embed(request: TextRequest):
    emb = get_embedding(request.text)
    return {"embedding": emb.tolist(), "dimension": len(emb)}

@app.post("/classify", response_model=ClassifyResponse)
async def classify(request: TextRequest):
    return classify_text(request.text)

@app.post("/priority-score", response_model=PriorityResponse)
async def priority(request: TextRequest):
    return score_priority(request.text)

@app.post("/extract-entities")
async def entities(request: TextRequest):
    return extract_entities(request.text)

@app.post("/find-similar")
async def similar(request: SimilarRequest):
    return find_similar(request.text, request.grievanceId, request.topK)

@app.post("/summarize")
async def summarize(request: TextRequest):
    summary = summarize_text(request.text)
    return {"summary": summary}

@app.post("/rag-query")
async def rag(request: RAGRequest):
    return rag_query(request.question, request.department)

@app.post("/cluster")
async def cluster(request: dict):
    return {"status": "scheduled", "message": "Clustering job queued successfully"}
