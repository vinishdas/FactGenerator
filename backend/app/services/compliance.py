# app/services/compliance.py
import re
from urllib.parse import urlparse
from app.services.scraper import scrape_url

# --- SINGAPORE COMPLIANCE VOCABULARY (HSA/PHMC ALIGNED) ---
# FAIL if these patterns are found (Public-facing promotion/Directive advice)

# 1. Commercial / Call to Action (Strictly prohibited for Rx meds)
# Refined to avoid catching "price of treatment" in studies or "health promotion"
COMMERCIAL_PATTERNS = [
    r"\bbuy\s+(now|online)\b", 
    r"\border\s+(now|online)\b", 
    r"\badd\s+to\s+cart\b", 
    r"\bcheckout\s+now\b", 
    r"\b(special|limited|flash)\s+(price|sale|offer|discount)\b", 
    r"\bdiscount\s+code\b", 
    r"\bpromo(?:tion)?\s+code\b",
    r"\bshop\s+now\b", 
    r"\bfree\s+shipping\b",
    r"\bmoney[\s-]*back\s+guarantee\b"
]

# 2. Testimonials & Claims (HSA prohibits testimonials for medical services)
# Refined to avoid "Literature Review" or "Systematic Review"
CLAIM_PATTERNS = [
    r"\b(customer|patient|user)\s+(testimonial|review)s?\b", 
    r"\b(rated|voted)\s+5\s+stars\b", 
    r"\b(miracle|magic)\s+cure\b", 
    r"\bguaranteed\s+results?\b",
    r"\bbest\s+treatment\s+in\s+singapore\b", 
    r"\bbefore\s+and\s+after\s+(photos?|images?)\b" # Strictly regulated for aesthetics
]

# 3. Directive Treatment Advice (Only doctors can direct; web content must be educational)
DIRECTIVE_PATTERNS = [
    r"\bask\s+for\s+(a\s+)?prescription\b", 
    r"\bget\s+your\s+prescription\b",
    r"\bdoctor\s+approved\b" 
]

# Combine all patterns
FAIL_PATTERNS = COMMERCIAL_PATTERNS + CLAIM_PATTERNS + DIRECTIVE_PATTERNS

# Compile patterns once for millisecond performance
COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in FAIL_PATTERNS]

# 4. Trusted Domains (Automatic PASS for Government/Academic/Major Medical)
TRUSTED_DOMAINS = [
    "ncbi.nlm.nih.gov",
    "pubmed.ncbi.nlm.nih.gov",
    "who.int",
    "cdc.gov",
    "gov.sg",
    "moh.gov.sg",
    "hsa.gov.sg",
    "mayoclinic.org",
    "clevelandclinic.org",
    "hopkinsmedicine.org",
    "healthhub.sg"
]

def check_text_compliance(text: str, is_trusted_source: bool = False) -> dict:
    """
    Algorithm: Binary Tagging (PASS/FAIL).
    Speed: ~2ms for 5000 words.
    """
    if not text:
        return {"status": "FAIL", "reason": "No content found"}

    # 1. Trusted Source Bypass
    # If the domain is whitelisted (e.g. NCBI, Govt), we skip the strict commercial regex 
    # because they often contain words like "Review" (Systematic Review) or "Price" (Cost analysis) 
    # but are never selling Rx drugs directly to consumers.
    if is_trusted_source:
        return {
            "status": "PASS", 
            "reason": "Source is from a trusted medical/government/academic domain."
        }

    # 2. Run heuristic checks for general sources
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
    Fetches content and checks compliance with domain awareness.
    """
    # 1. Domain Check
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        # Remove 'www.' for cleaner matching
        if domain.startswith("www."):
            domain = domain[4:]
        
        # Check against trusted list or .gov/.edu TLDs
        is_trusted = any(td in domain for td in TRUSTED_DOMAINS) or \
                     domain.endswith(".gov") or \
                     domain.endswith(".edu") or \
                     domain.endswith(".ac.uk")
    except:
        is_trusted = False

    # 2. Scrape
    content = scrape_url(url)
    if not content:
        return {"status": "FAIL", "reason": "Could not scrape URL"}
    
    # 3. Check Text
    return check_text_compliance(content, is_trusted_source=is_trusted)