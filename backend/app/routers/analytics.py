# app/routers/analytics.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.fact_models import Fact, Stage, ComplianceResult
from app.services.analytics_vocabulary import STAGE_ANALYTICS_CONFIG
import re
from urllib.parse import urlparse

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# --- 1. DETECTION RULES (Medical Codes - Preserved) ---
DETECTION_RULES = {
    "SNOMED": {
        "regex": [
            r"\b\d{6,18}\b",             
            r"\bSCTID\s*[:=]?\s*\d+"     
        ],
        "keywords": [
            "SNOMED", "SCTID", "Systematized Nomenclature", "Clinical Terms", "Concept ID",
            "family history", "first-degree relative", "genetic susceptibility",
            "HLA-DRB1", "Shared Epitope", "tobacco user", "smoker", "passive smoking",
            "environmental exposure", "silica", "periodontitis", "pre-clinical risk",
            "autoantibody positive", "seropositive", "loss of tolerance",
            "ACPA positive", "Rheumatoid Factor positive", "immune dysregulation",
            "subclinical inflammation", "cytokine", "chemokine",
            "arthralgia", "joint pain", "morning stiffness", "stiffness >30 min",
            "swollen joint", "tender joint", "synovitis", "tenosynovitis",
            "limited range of motion", "functional impairment", "grip strength",
            "clinically suspect arthralgia", "CSA",
            "Rheumatoid arthritis", "Inflammatory arthritis", "Undifferentiated arthritis",
            "EULAR criteria", "ACR criteria", "classification criteria",
            "Methotrexate", "Leflunomide", "Sulfasalazine", "Hydroxychloroquine", 
            "Glucocorticoid", "Prednisone", "Bridging therapy",
            "Disease activity score", "DAS28", "CDAI", "SDAI", "Remission",
            "Bone erosion", "Joint deformity", "Ulnar deviation", "Swan neck deformity",
            "Interstitial lung disease", "Rheumatoid nodule", "Vasculitis",
            "Osteoporosis", "Cardiovascular disease", "Felty syndrome",
            "Biologic DMARD", "TNF inhibitor", "JAK inhibitor", "Abatacept", "Rituximab",
            "Arthroplasty", "Joint replacement", "Synovectomy", "Rehabilitation"
        ]
    },
    "LOINC": {
        "regex": [
            r"\b\d{3,7}\-\d\b",          
            r"\bLOINC\s*[:=]?\s*\d+"     
        ],
        "keywords": [
            "LOINC", "Logical Observation", "Observation Identifier", "Lab code",
            "C-reactive protein", "CRP", "hs-CRP",
            "Erythrocyte sedimentation rate", "ESR", "Sed rate",
            "Calprotectin", "Vectra DA", "Multi-biomarker disease activity",
            "Rheumatoid Factor", "RF", "RF IgM", "RF IgA",
            "Anti-CCP", "ACPA", "Anti-citrullinated", "Citrullinated peptide",
            "Antinuclear antibody", "ANA", "ENA panel", "Anti-MCV",
            "Carbamylated protein", "Anti-CarP",
            "Alanine aminotransferase", "ALT", "Aspartate aminotransferase", "AST",
            "Creatinine", "Glomerular filtration rate", "eGFR",
            "Hemoglobin", "Platelet count", "White blood cell count", "Neutrophil count",
            "Hepatitis B surface antigen", "QuantiFERON", "TB screening",
            "DAS28-CRP", "DAS28-ESR"
        ]
    },
    "ICD-10": {
        "regex": [
            r"\b[A-Z]\d{2}(?:\.?\d{1,4})?\b", 
            r"\bICD\s*10\b",             
            r"\bICD-10\b",               
            r"\bCM\s*Code\b"             
        ],
        "keywords": [
            "ICD-10", "ICD 10", "International Classification", "Diagnosis Code", "Billing Code",
            "M05", "Seropositive rheumatoid arthritis", "Rheumatoid lung", "Rheumatoid vasculitis",
            "M06", "Seronegative rheumatoid arthritis", "Other rheumatoid arthritis",
            "M05.7", "M05.8", "M06.0", "M06.9",
            "M25.5", "Pain in joint", "Polyarthralgia",
            "M25.4", "Effusion", "Joint swelling",
            "M25.0", "Hemarthrosis",
            "R68.89", "General symptoms", "Morning stiffness",
            "Z82.6", "Family history of arthritis",
            "Z72.0", "Tobacco use", "Smoker",
            "Z13.828", "Screening for rheumatic disorder",
            "R76.8", "Abnormal immunological findings", "Raised antibody titer",
            "M81", "Osteoporosis", "Pathological fracture",
            "J99", "Respiratory disorders", "Pleural effusion",
            "I30", "Pericarditis", "Cardiovascular risk",
            "Sjögren", "Sicca syndrome", "M35.0"
        ]
    }
}

# --- 2. STAGE RELEVANCE (SR) RULES ---
SR_RULES = {
    "SR2": {
        "Stage 1": ["hla-drb1", "shared epitope", "first-degree relative", "genetic risk", "mucosal origin", "pre-antibody"],
        "Stage 2": ["acpa positive", "anti-ccp", "rheumatoid factor", "seropositive", "pre-clinical ra", "asymptomatic autoimmunity"],
        "Stage 3": ["clinically suspect arthralgia", "csa", "morning stiffness", "subclinical synovitis", "imminent ra"],
        "Stage 4": ["acr/eular", "classification criteria", "methotrexate", "window of opportunity", "treat-to-target", "synovitis"],
        "Stage 5": ["biologic", "tnf inhibitor", "jak inhibitor", "erosion", "joint replacement", "comorbidity", "refractory"]
    },
    "SR1": ["pre-clinical", "borderline", "at-risk", "early signs", "suspected", "undifferentiated arthritis", "risk factor"]
}

# --- 3. AUTHORITY TIER RULES ---
TIER_DOMAINS = {
    "A": ["gov", "edu", "mil", "org.sg", "nih.gov", "pubmed", "ncbi", "who.int", "cdc.gov", "fda.gov", "hsa.gov.sg", "bmj.com", "thelancet.com", "nejm.org", "nature.com", "science.org", "wiley.com", "oup.com", "springer.com", "sciencedirect.com", "jamanetwork.com", "rheumatology.org", "eular.org", "acr.org"],
    "B": ["mayoclinic.org", "clevelandclinic.org", "hopkinsmedicine.org", "webmd.com", "healthline.com", "medscape.com", "medicalnewstoday.com", "uptodate.com", "arthritis.org", "versusarthritis.org"],
    "D": ["facebook.com", "twitter.com", "x.com", "instagram.com", "youtube.com", "tiktok.com", "reddit.com", "quora.com", "pinterest.com", "blogspot.com", "wordpress.com"]
}

# --- HELPER FUNCTIONS ---

def check_regex_match(text: str, patterns: list) -> bool:
    for p in patterns:
        if re.search(p, text, re.IGNORECASE):
            return True
    return False

def check_keyword_match(text: str, keywords: list) -> bool:
    text_lower = text.lower()
    for kw in keywords:
        pattern = r"\b" + re.escape(kw.lower()) + r"\b"
        if re.search(pattern, text_lower):
            return True
    return False

def calculate_sr_score(text: str, stage_name: str) -> int:
    target_key = None
    for key in SR_RULES["SR2"].keys():
        if key.lower() in stage_name.lower():
            target_key = key
            break
    
    if not target_key: return 0 

    if check_keyword_match(text, SR_RULES["SR2"][target_key]): return 2
    if check_keyword_match(text, SR_RULES["SR1"]): return 1
    return 0

def calculate_authority_tier(url: str) -> str:
    if not url or url == "Uploaded Text": return "C"
    try:
        domain = urlparse(url).netloc.lower()
        if not domain: return "C"
        if any(d in domain for d in TIER_DOMAINS["D"]): return "D"
        if domain.endswith(".gov") or domain.endswith(".edu") or domain.endswith(".mil"): return "A"
        if any(d in domain for d in TIER_DOMAINS["A"]): return "A"
        if any(d in domain for d in TIER_DOMAINS["B"]): return "B"
        return "C"
    except:
        return "C"

def check_codes(text: str):
    results = {"SNOMED": False, "LOINC": False, "ICD-10": False}
    if not text: return results
    text_upper = text.upper()
    for code_type, rules in DETECTION_RULES.items():
        for kw in rules["keywords"]:
            if kw.upper() in text_upper:
                results[code_type] = True
                break
        if not results[code_type]:
            for pattern in rules["regex"]:
                if re.search(pattern, text, re.IGNORECASE):
                    results[code_type] = True
                    break
    return results

def check_coverage(text: str, keywords: list):
    return check_keyword_match(text, keywords)

@router.get("/stage/{stage_id}")
def get_stage_analytics(stage_id: int, db: Session = Depends(get_db)):
    stage = db.query(Stage).filter(Stage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    vocab = STAGE_ANALYTICS_CONFIG.get("Stage 4") # Default
    for key in STAGE_ANALYTICS_CONFIG.keys():
        if key.lower() in stage.name.lower():
            vocab = STAGE_ANALYTICS_CONFIG[key]
            break

    facts = db.query(Fact).filter(Fact.stage_id == stage_id).all()
    compliance_logs = db.query(ComplianceResult).filter(ComplianceResult.stage_id == stage_id).all()

    # --- AGGREGATION ---
    url_groups = {} 
    for fact in facts:
        url = fact.source_url or "Uploaded Text"
        if url not in url_groups:
            url_groups[url] = ""
        url_groups[url] += " " + fact.fact_text

    # --- COMPLIANCE ---
    unique_compliance = {}
    for log in compliance_logs:
        if log.url not in unique_compliance or log.status == "FAIL":
            unique_compliance[log.url] = log

    compliance_stats = {"pass": 0, "fail": 0}
    compliance_details = []
    for log in unique_compliance.values():
        if log.status == "PASS": compliance_stats["pass"] += 1
        else: compliance_stats["fail"] += 1
        compliance_details.append({
            "id": log.id, "url": log.url, "tag": log.status, "reason": log.reason, "timestamp": log.created_at
        })

    # --- SOURCE ANALYSIS (Codes + SR + Tier) ---
    code_counts = {"SNOMED": 0, "LOINC": 0, "ICD-10": 0}
    # Initialized counters to prevent errors
    sr_counts = {0: 0, 1: 0, 2: 0}
    tier_counts = {"A": 0, "B": 0, "C": 0, "D": 0}
    
    source_details = [] 
    
    for url, combined_text in url_groups.items():
        # 1. Codes
        url_codes = check_codes(combined_text)
        if "SNOMED" in url.upper(): url_codes["SNOMED"] = True
        if "LOINC" in url.upper(): url_codes["LOINC"] = True
        if "ICD" in url.upper(): url_codes["ICD-10"] = True

        if url_codes["SNOMED"]: code_counts["SNOMED"] += 1
        if url_codes["LOINC"]: code_counts["LOINC"] += 1
        if url_codes["ICD-10"]: code_counts["ICD-10"] += 1
        
        # 2. SR Score
        sr_score = calculate_sr_score(combined_text, stage.name)
        sr_counts[sr_score] += 1

        # 3. Authority Tier
        tier = calculate_authority_tier(url)
        tier_counts[tier] += 1

        source_details.append({
            "id": hash(url),
            "url": url,
            "codes": url_codes,  # Nested structure for frontend consistency
            "sr_score": sr_score,
            "tier": tier
        })

    # --- CONTENT COVERAGE ---
    topic_counts = {k: 0 for k in vocab["topics"].keys()}
    function_counts = {k: 0 for k in vocab["functions"].keys()}
    total_facts = len(facts)

    for fact in facts:
        for key, info in vocab["topics"].items():
            if check_coverage(fact.fact_text, info["keywords"]):
                topic_counts[key] += 1
        for func_name, keywords in vocab["functions"].items():
            if check_coverage(fact.fact_text, keywords):
                function_counts[func_name] += 1

    def format_coverage(raw_counts, ref_dict, is_topic=True):
        output = []
        for key, count in raw_counts.items():
            name = ref_dict[key]["name"] if is_topic else key
            pct = (count / total_facts * 100) if total_facts > 0 else 0
            status = "Green" if pct > 20 else ("Amber" if pct > 10 else "Red")
            output.append({
                "id": key if is_topic else name,
                "name": name,
                "count": count,
                "percentage": round(pct, 1),
                "status": status
            })
        if is_topic: output.sort(key=lambda x: x["id"])
        return output

    total_compliance = compliance_stats["pass"] + compliance_stats["fail"]
    
    return {
        "meta": {
            "stage_id": stage.id,
            "stage_name": stage.name,
            "total_facts": total_facts,
            "total_urls": len(url_groups)
        },
        "compliance": {
            "pass": compliance_stats["pass"],
            "fail": compliance_stats["fail"],
            "rate": round((compliance_stats["pass"] / total_compliance * 100), 1) if total_compliance > 0 else 0
        },
        "compliance_details": compliance_details,
        "sr_stats": sr_counts,      # Added for Widget
        "tier_stats": tier_counts,  # Added for Widget
        "codes": code_counts,
        "source_details": source_details, # Renamed from code_details for frontend consistency
        "topics": format_coverage(topic_counts, vocab["topics"], True),
        "functions": format_coverage(function_counts, vocab["functions"], False)
    }