import re

LOCATION_PATTERNS = [
    r'(?:in|at|near|from|beside|opposite)\s+([A-Z][a-zA-Z0-9\s]+(?:District|City|Town|Village|Area|Colony|Nagar|Sector|Block|Ward|Road|Marg|Enclave))',
    r'((?:Sector|Block|Ward)\s*\d+[A-Z]?)',
    r'([A-Z][a-zA-Z]+(?:\s(?:Road|Street|Marg|Nagar|Colony|Vihar|Enclave|Chowk)))',
    r'([A-Z][a-zA-Z\s]+(?:New Delhi|Delhi|Mumbai|Bengaluru|Gurugram|Noida|Faridabad))'
]

DURATION_PATTERNS = [
    r'(\d+\s*(?:days?|din|hours?|ghante|weeks?|hafte|months?|mahine))'
]

def extract_entities(text):
    text_lower = text.lower()
    
    location = None
    for pattern in LOCATION_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            location = match.group(1).strip()
            break
            
    duration = None
    for pattern in DURATION_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            duration = match.group(0)
            break
            
    affected_match = re.search(r'(\d+)\s*(?:people|persons|families|patients|students|households|ghar)', text_lower)
    affected_count = int(affected_match.group(1)) if affected_match else None
    
    orgs = re.findall(r'\b(?:MCD|DDA|PWD|DJB|BSES|NDMC|DMRC|AIIMS|ESIC|CBSE|UPSC|SSC|Bank|Hospital|School|Office)\b', text, re.IGNORECASE)
    
    return {
        "location": location,
        "duration": duration,
        "affectedCount": affected_count,
        "organizations": list(set(orgs))
    }
