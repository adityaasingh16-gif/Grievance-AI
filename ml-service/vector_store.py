import numpy as np
from classifier import get_embedding

try:
    import faiss
    HAS_FAISS = True
except ImportError:
    HAS_FAISS = False
    print("Warning: FAISS not installed. Using numpy cosine similarity fallback.")

DIMENSION = 384

class VectorStore:
    def __init__(self):
        self.grievances = [] # list of dicts: {id, text, embedding}
        if HAS_FAISS:
            self.index = faiss.IndexFlatIP(DIMENSION)
        else:
            self.index = None

    def normalize(self, v):
        norm = np.linalg.norm(v)
        return v / (norm if norm > 0 else 1.0)

    def add(self, grievance_id, text):
        emb = get_embedding(text)
        emb_norm = self.normalize(emb).astype('float32')
        
        idx = len(self.grievances)
        self.grievances.append({
            "id": grievance_id,
            "text": text,
            "embedding": emb_norm
        })
        
        if HAS_FAISS and self.index is not None:
            self.index.add(emb_norm.reshape(1, -1))
        return idx

    def find_similar(self, text, grievance_id=None, top_k=5, threshold=0.65):
        if not self.grievances:
            return {"similarIds": [], "similarDetails": [], "clusterId": None, "isDuplicate": False, "parentId": None}

        emb = get_embedding(text)
        emb_norm = self.normalize(emb).astype('float32')

        results = []
        if HAS_FAISS and self.index is not None and self.index.ntotal > 0:
            scores, indices = self.index.search(emb_norm.reshape(1, -1), min(top_k + 1, self.index.ntotal))
            for score, idx in zip(scores[0], indices[0]):
                if idx < len(self.grievances):
                    g = self.grievances[idx]
                    if g["id"] != grievance_id:
                        results.append({"grievanceId": g["id"], "score": float(score), "text": g["text"]})
        else:
            # Numpy fallback
            for g in self.grievances:
                if g["id"] != grievance_id:
                    score = float(np.dot(emb_norm, g["embedding"]))
                    results.append({"grievanceId": g["id"], "score": score, "text": g["text"]})
            results.sort(key=lambda x: x["score"], reverse=True)

        similar_filtered = [r for r in results if r["score"] >= threshold][:top_k]
        is_dup = any(r["score"] >= 0.85 for r in similar_filtered)
        parent = similar_filtered[0]["grievanceId"] if similar_filtered else None

        return {
            "similarIds": [s["grievanceId"] for s in similar_filtered],
            "similarDetails": similar_filtered,
            "clusterId": f"cluster_{parent}" if parent else None,
            "isDuplicate": is_dup,
            "parentId": parent
        }

vector_store_instance = VectorStore()

def add_to_index(grievance_id, text):
    return vector_store_instance.add(grievance_id, text)

def find_similar(text, grievance_id=None, top_k=5):
    return vector_store_instance.find_similar(text, grievance_id, top_k)

def get_index_stats():
    return {"total_vectors": len(vector_store_instance.grievances), "dimension": DIMENSION}
