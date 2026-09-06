import re
import numpy as np

# Load sentence transformer lazily or with fallbacks
model = None

def get_model():
    global model
    if model is None:
        try:
            from sentence_transformers import SentenceTransformer
            print("Loading paraphrase-multilingual-MiniLM-L12-v2 model...")
            model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        except Exception as e:
            print(f"Warning: Could not load SentenceTransformer ({e}). Falling back to keyword-based embedding vectors.")
            model = "FALLBACK"
    return model

CATEGORIES = {
    "Water Supply": {
        "dept": "Water Supply",
        "keywords": ["water", "pani", "पानी", "tap", "pipeline", "leak", "supply", "pressure", "dirty water", "nal", "tubewell"],
        "subcategories": {
            "Pipeline Leakage": ["leak", "burst", "pipe", "pipeline", "leaking", "overflow"],
            "No Water Supply": ["no water", "dry", "supply cut", "band", "nahi aa raha"],
            "Water Quality": ["dirty", "contaminated", "smell", "color", "ganda pani", "sewage"]
        }
    },
    "Electricity": {
        "dept": "Electricity",
        "keywords": ["power", "electricity", "bijli", "बिजली", "light", "current", "bill", "meter", "transformer", "voltage", "outage"],
        "subcategories": {
            "Frequent Cuts": ["frequent", "cut", "tripping", "load shedding", "cuts"],
            "Transformer Issue": ["transformer", "burn", "fault", "spark", "dhua", "blast"],
            "Billing Dispute": ["bill", "meter", "overcharge", "reading", "wrong bill"]
        }
    },
    "Roads & Infrastructure": {
        "dept": "Roads & Infrastructure",
        "keywords": ["road", "sadak", "सड़क", "pothole", "street", "drain", "sewer", "light", "bridge", "gadda"],
        "subcategories": {
            "Potholes": ["pothole", "crater", "damage", "gadda", "broken road"],
            "Street Lights": ["street light", "lamp", "dark", "andhera"],
            "Drainage": ["drain", "sewer", "overflow", "nadi", "nalla"]
        }
    },
    "Sanitation": {
        "dept": "Sanitation",
        "keywords": ["garbage", "waste", "kachra", "कचरा", "trash", "clean", "safai", "toilet", "sewage"],
        "subcategories": {
            "Missed Collection": ["not collected", "missed", "skip", "kachra gadi"],
            "Illegal Dumping": ["dumping", "litter", "illegal", "pile"],
            "Public Toilet": ["toilet", "open", "defecation", "dirty toilet"]
        }
    },
    "Public Transport": {
        "dept": "Public Transport",
        "keywords": ["bus", "metro", "train", "transport", "traffic", "route", "fare", "ticket", "conductor"],
        "subcategories": {
            "Route Issue": ["route", "stop", "cancel", "delay"],
            "Overcrowding": ["crowd", "packed", "rush"],
            "Fare Dispute": ["fare", "ticket", "overcharge"]
        }
    },
    "Healthcare": {
        "dept": "Healthcare",
        "keywords": ["hospital", "doctor", "medicine", "health", "clinic", "ambulance", "patient", "treatment", "dawa"],
        "subcategories": {
            "Staff Shortage": ["shortage", "staff", "nurse", "doctor missing"],
            "Equipment Failure": ["equipment", "machine", "broken"],
            "Long Wait Times": ["wait", "queue", "delay", "time"]
        }
    },
    "Education": {
        "dept": "Education",
        "keywords": ["school", "education", "teacher", "student", "padhai", "college", "university", "exam", "school building"],
        "subcategories": {
            "Building Repair": ["building", "repair", "roof", "wall"],
            "Teacher Absence": ["teacher", "absent", "missing"],
            "Midday Meal": ["meal", "food", "lunch", "khana"]
        }
    },
    "Corruption & Misconduct": {
        "dept": "Corruption & Misconduct",
        "keywords": ["bribe", "corruption", "rishwat", "रिश्वत", "misconduct", "fraud", "cheating", "illegal money"],
        "subcategories": {
            "Demand for Bribe": ["demand", "bribe", "money", "pay", "rishwat"],
            "Favoritism": ["favor", "nepotism", "bias"],
            "Misuse of Funds": ["fund", "misuse", "embezzle", "budget"]
        }
    }
}

def detect_language(text):
    hindi_chars = sum(1 for c in text if '\u0900' <= c <= '\u097F')
    total_chars = len([c for c in text if c.isalpha()])
    if total_chars == 0:
        return "en"
    ratio = hindi_chars / total_chars
    if ratio > 0.4:
        return "hi"
    elif ratio > 0.05 or any(w in text.lower() for w in ["pani", "bijli", "sadak", "kachra", "rishwat", "gaddi", "nahi", "raha", "hai"]):
        return "hinglish"
    return "en"

def classify_text(text):
    text_lower = text.lower()
    lang = detect_language(text)
    
    scores = {}
    for cat_name, cat_data in CATEGORIES.items():
        score = 0
        matched_keywords = []
        for kw in cat_data["keywords"]:
            if kw.lower() in text_lower:
                score += 1
                matched_keywords.append(kw)
        scores[cat_name] = {
            "score": score, 
            "keywords": matched_keywords, 
            "data": cat_data
        }
    
    # Pick category with maximum keyword matches
    best_cat = max(scores, key=lambda x: scores[x]["score"])
    cat_data = scores[best_cat]["data"]
    
    # If no keyword matches, default to General / Water
    if scores[best_cat]["score"] == 0:
        best_cat = "Water Supply"
        cat_data = CATEGORIES["Water Supply"]
    
    # Find best subcategory
    subcat = None
    sub_scores = {}
    for sub_name, sub_kws in cat_data["subcategories"].items():
        sub_scores[sub_name] = sum(1 for kw in sub_kws if kw.lower() in text_lower)
    
    if sub_scores:
        best_sub = max(sub_scores, key=sub_scores.get)
        if sub_scores[best_sub] > 0:
            subcat = best_sub
        else:
            subcat = list(cat_data["subcategories"].keys())[0]

    # Calculate confidence score
    total_keywords = len(cat_data["keywords"])
    confidence = min(0.95, max(0.65, scores[best_cat]["score"] / max(total_keywords * 0.25, 1)))

    return {
        "category": best_cat,
        "department": cat_data["dept"],
        "subcategory": subcat,
        "confidence": round(confidence, 2),
        "keywords": scores[best_cat]["keywords"][:5] if scores[best_cat]["keywords"] else ["general"],
        "language": lang
    }

def get_embedding(text):
    m = get_model()
    if m != "FALLBACK" and hasattr(m, 'encode'):
        return m.encode(text, convert_to_numpy=True)
    else:
        # Pseudo embedding generator based on word hashes for resilient fallback
        vec = np.zeros(384, dtype=np.float32)
        words = text.lower().split()
        for w in words:
            h = hash(w) % 384
            vec[h] += 1.0
        norm = np.linalg.norm(vec)
        return vec / (norm if norm > 0 else 1.0)
