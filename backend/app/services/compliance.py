# app/services/compliance.py
import re
from app.services.scraper import scrape_url

# --- SINGAPORE COMPLIANCE VOCABULARY (HSA/PHMC ALIGNED) ---
# FAIL if these patterns are found (Public-facing promotion/Directive advice)
FAIL_PATTERNS = [
    # 1. Commercial / Call to Action (Strictly prohibited for Rx meds)
    r"\bbuy\s+now\b", r"\border\s+online\b", r"\badd\s+to\s+cart\b", 
    r"\bcheckout\b", r"\bprice\b", r"\bdiscount\b", r"\bpromotion\b", 
    r"\bsale\b", r"\bshop\s+now\b", r"\bfree\s+shipping\b",
    
    # 2. Testimonials & Claims (HSA prohibits testimonials for medical services)
    r"\btestimonial\b", r"\breviews?\b", r"\brated\s+5\s+stars\b", 
    r"\bsaved\s+my\s+life\b", r"\bmiracle\s+cure\b", r"\bguaranteed\b", 
    r"\bbest\s+treatment\b", r"\bbefore\s+and\s+after\b",
    
    # 3. Directive Treatment Advice (Only doctors can direct; web content must be educational)
    r"\byou\s+should\s+take\b", r"\byou\s+must\s+use\b", 
    r"\bask\s+for\s+prescription\b", r"\bget\s+your\s+prescription\b",
    r"\bdoctor\s+approved\b"
]

# Compile patterns once for millisecond performance
COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in FAIL_PATTERNS]

def check_text_compliance(text: str) -> dict:
    """
    Algorithm: Binary Tagging (PASS/FAIL).
    Speed: ~2ms for 5000 words.
    """
    if not text:
        return {"status": "FAIL", "reason": "No content found"}

    # Run heuristic checks
    failures = []
    for pattern in COMPILED_PATTERNS:
        match = pattern.search(text)
        if match:
            failures.append(match.group(0))
            if len(failures) >= 3: # Stop early if multiple violations found
                break
    
    if failures:
        return {
            "status": "FAIL", 
            "reason": f"Promotional/Directive language detected: {', '.join(failures)}"
        }
    
    return {
        "status": "PASS", 
        "reason": "Content appears educational and non-promotional."
    }

def check_compliance_for_url(url: str) -> dict:
    """
    Fetches content and checks compliance.
    """
    # Reuse your existing scraper
    content = scrape_url(url)
    if not content:
        return {"status": "FAIL", "reason": "Could not scrape URL"}
    
    return check_text_compliance(content)