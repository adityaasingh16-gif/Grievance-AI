import numpy as np
from classifier import get_embedding

SOP_CORPUS = [
    {
        "department": "Water Supply",
        "title": "Pipeline Leakage SOP",
        "content": "Water pipeline leakage SOP: 1) Verify complaint location and pipe diameter. 2) Dispatch field engineering team within 2 hours for critical bursts. 3) Temporary clamping within 4 hours. 4) Permanent pipe replacement within 24 hours. 5) Restore road surface and notify citizen via SMS update."
    },
    {
        "department": "Water Supply",
        "title": "Water Quality & Contamination SOP",
        "content": "Water Quality SOP: 1) Collect 3 water samples from affected locality. 2) Perform lab test for coliform bacteria and TDS levels. 3) Flush main pipeline if contamination detected. 4) Provide mobile water tankers to affected citizens during flushing."
    },
    {
        "department": "Electricity",
        "title": "Power Outage & Transformer SOP",
        "content": "Power outage SOP: 1) Remote check transformer status via SCADA system. 2) If transformer fault or oil leak, dispatch mobile generator unit within 1 hour. 3) For high voltage line faults, send line inspection team. 4) Restoration timeframe: 2-4 hours for minor, 8-12 hours for major overhaul."
    },
    {
        "department": "Roads & Infrastructure",
        "title": "Pothole Repair Guidelines SOP",
        "content": "Road pothole repair SOP: 1) Assess pothole depth and traffic hazard level. 2) For critical potholes (>1ft deep on main arterial roads), perform emergency cold mix patching within 4 hours. 3) Standard repair: hot mix asphalt sealing within 7 days."
    },
    {
        "department": "Sanitation",
        "title": "Missed Garbage Collection SOP",
        "content": "Garbage collection missed SOP: 1) Verify auto-tipper GPS route log. 2) Arrange emergency collection vehicle within 6 hours. 3) Issue warning to designated contractor if route skipped consecutively. 4) Re-route collection vehicle for high-density areas."
    },
    {
        "department": "Healthcare",
        "title": "Hospital Staff & Emergency SOP",
        "content": "Hospital staff shortage SOP: 1) Verify doctor/nurse duty roster. 2) Activate emergency on-call roster. 3) For prolonged shortages (>3 days), request temporary staff deputation from district pool."
    }
]

rag_embeddings = []

def init_rag():
    global rag_embeddings
    embeddings = []
    for doc in SOP_CORPUS:
        emb = get_embedding(doc["content"])
        norm = np.linalg.norm(emb)
        embeddings.append(emb / (norm if norm > 0 else 1.0))
    rag_embeddings = np.array(embeddings, dtype=np.float32)

init_rag()

def rag_query(question, department=None):
    if len(rag_embeddings) == 0:
        init_rag()

    q_emb = get_embedding(question)
    q_norm = np.linalg.norm(q_emb)
    q_emb_norm = q_emb / (q_norm if q_norm > 0 else 1.0)

    similarities = np.dot(rag_embeddings, q_emb_norm)

    candidates = []
    for i, doc in enumerate(SOP_CORPUS):
        if department and doc["department"].lower() != department.lower():
            # Apply slight penalty for non-matching department
            score = float(similarities[i]) * 0.7
        else:
            score = float(similarities[i])
        candidates.append((score, i))

    candidates.sort(key=lambda x: x[0], reverse=True)
    top_doc_idx = candidates[0][1]
    best_score = candidates[0][0]

    matched_doc = SOP_CORPUS[top_doc_idx]

    answer = f"According to the {matched_doc['department']} SOP ('{matched_doc['title']}'): {matched_doc['content']}"

    return {
        "answer": answer,
        "sources": [{
            "title": matched_doc["title"],
            "department": matched_doc["department"],
            "content": matched_doc["content"]
        }],
        "confidence": round(float(best_score), 2)
    }
