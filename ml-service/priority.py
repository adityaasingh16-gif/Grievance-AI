import re

PRIORITY_KEYWORDS = {
    "Critical": [
        "death", "murder", "accident", "emergency", "fire", "collapse", "flood",
        "danger", "life threatening", "severe", "critical", "urgent", "hospitalized",
        "burst", "dhua", "spark", "blast", "aag", "आग", "गंभीर", "आपातकालीन"
    ],
    "High": [
        "no supply", "broken", "not working", "failed", "outage", "leakage", "polluted",
        "unsafe", "risk", "illegal", "corruption", "bribe", "fraud",
        "pani nahi", "bijli band", "rishwat", "रिश्वत", "खराब"
    ]
}

def score_priority(text):
    text_lower = text.lower()
    score = 50  # Base score
    priority = "Medium"
    reasoning_parts = []
    
    # Check critical keywords
    critical_hits = [kw for kw in PRIORITY_KEYWORDS["Critical"] if kw.lower() in text_lower]
    if critical_hits:
        score = min(100, score + 40 + len(critical_hits) * 5)
        priority = "Critical"
        reasoning_parts.append(f"Critical emergency keywords detected: {', '.join(critical_hits[:3])}")
    
    # Check high keywords
    high_hits = [kw for kw in PRIORITY_KEYWORDS["High"] if kw.lower() in text_lower]
    if high_hits and priority == "Medium":
        score = min(95, score + 25 + len(high_hits) * 3)
        priority = "High"
        reasoning_parts.append(f"High severity keywords detected: {', '.join(high_hits[:3])}")
    
    # Check affected count numbers
    numbers = re.findall(r'\b(\d+)\s*(?:people|persons|families|patients|students|households|ghar|लोग|परिवार)?\b', text_lower)
    if numbers:
        affected = max([int(n) for n in numbers if n.isdigit() and int(n) < 100000] or [0])
        if affected > 100:
            score = min(100, score + 15)
            reasoning_parts.append(f"Large population affected (~{affected}+)")
        elif affected > 10:
            score = min(100, score + 10)
            reasoning_parts.append(f"Moderate population affected (~{affected}+)")

    # Check duration mentioned
    duration_patterns = re.findall(r'(\d+)\s*(?:days?|months?|years?|din|ghante|hours?|दिन|घंटे)', text_lower)
    if duration_patterns:
        max_val = max([int(d) for d in duration_patterns if d.isdigit()] or [0])
        if max_val >= 3:
            score = min(100, score + 10)
            reasoning_parts.append(f"Long standing issue ({max_val}+ days/hours)")

    score = min(100, max(10, score))
    
    if score >= 80 and priority != "Critical":
        priority = "High"
    elif score < 40:
        priority = "Low"

    return {
        "priority": priority,
        "score": score,
        "reasoning": "; ".join(reasoning_parts) if reasoning_parts else "Standard priority assigned based on text content"
    }
