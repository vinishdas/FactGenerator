# backend/app/services/ra_vocabulary.py

# --- BAD START WORDS (Strict Filtering) ---
# Sentences starting with these often indicate fragments, list headers, or continuations.
BAD_START_WORDS = {
    "comprehensive", "including", "with", "allow", "allows", "whereas", "while", 
    "versus", "compare", "comparing", "table", "figure", "fig", "source", "note",
    "except", "unless", "although", "despite", "given", "due", "because",
    "see", "refer", "click", "read", "view", "citation", "reference", "doi", 
    "copyright", "abstract", "introduction", "background", "keywords",
    "conclusion", "summary", "methods", "discussion"
}

# --- STOP PATTERNS (Structure Cleaning) ---
BAD_STRUCTURE_PATTERNS = [
    r"\|",                  # Table columns
    r"\d{4};\d+:\d+",       # Citations: 2022;12:100
    r"et al",               # Citations
    r"https?://",           # URLs
    r"doi\.org",            # DOIs
    r"^[\d\.\)]+\s",        # Numbered lists (e.g., "1. " or "2.3 ") at start
    r"^[a-zA-Z]\)\s",       # Lettered lists (e.g., "a) ")
    r"copyright",           # Copyright
    r"all rights reserved",
    r"^fig\.",              # Figure captions
    r"^tab\."               # Table captions
]

# --- META-LANGUAGE (Context Cleaning) ---
# Filters out "Study Talk" to ensure clinical fact generation
META_KEYWORDS = [
    "study aim", "we aimed", "participants were", "cohort", "p-value",
    "confidence interval", "odds ratio", "statistical", "university", 
    "funding", "disclosure", "correspondence", "author contributions",
    "conflict of interest", "received fees", "ethical approval",
    "focus group", "interview", "questionnaire", "qualitative study",
    "illness perception", "recruitment", "informed consent"
    # Removed "abstract", "background", "results", "conclusion" from here 
    # because they are checked in Start Words or via structure, 
    # and sometimes valid facts contain "The results showed..."
]

# --- EXPANDED KEYWORD BANKS (RA Specific 5-Stage Model) ---
RA_STAGES = {
    # STAGE 1: Risk / Asymptomatic (Genetic/Environmental Risk Only)
    "Stage 1": {
        "keywords": {
            "hla-drb1": 10, "shared epitope": 10, "family history": 8, "genetic risk": 8,
            "susceptibility": 6, "first-degree relative": 8, "heritability": 6,
            "environmental risk": 6, "smoking": 6, "silica": 5, "mucosal origin": 7,
            "microbiome": 5, "pre-antibody": 8, "asymptomatic": 6, "prevention": 5,
            "air pollution": 5, "periodontitis": 6, "gene-environment interaction": 7,
            "genetic predisposition": 7, "twin study": 6, "lifestyle risk": 6
        },
        "negative_keywords": [
            "synovitis", "swollen joint", "diagnosed ra", "methotrexate", "erosion",
            "anti-ccp", "acpa", "rheumatoid factor", "arthralgia", "pain"
        ]
    },

    # STAGE 2: Autoimmunity / Seropositive (Antibodies Present, No Symptoms)
    "Stage 2": {
        "keywords": {
            "acpa": 10, "anti-ccp": 10, "rheumatoid factor": 9, "rf positive": 9,
            "autoantibody": 9, "seropositive": 9, "preclinical ra": 10, 
            "antibody titer": 7, "epitope spreading": 7, "citrullination": 6,
            "loss of tolerance": 7, "systemic autoimmunity": 8, "no synovitis": 6,
            "asymptomatic autoimmunity": 8, "immune dysregulation": 6,
            "anti-carp": 7, "biomarker": 6, "subclinical inflammation": 7
        },
        "negative_keywords": [
            "clinical synovitis", "swelling", "bone erosion", "joint replacement",
            "joint pain", "stiffness", "arthralgia", "methotrexate"
        ]
    },

    # STAGE 3: CSA / Arthralgia (Symptoms Present, No Swelling)
    "Stage 3": {
        "keywords": {
            "clinically suspect arthralgia": 10, "csa": 10, "arthralgia": 9, 
            "joint pain": 7, "morning stiffness": 7, "squeeze test": 8,
            "subclinical synovitis": 9, "mri inflammation": 8, "ultrasound": 7,
            "progression to ra": 8, "imminent ra": 9, "symptomatic": 6,
            "inflammatory back pain": 5, "small joint pain": 7,
            "metatarsal": 6, "hand pain": 6, "stiffness": 6
        },
        "negative_keywords": [
            "clinical synovitis", "swollen", "joint replacement", "deformity",
            "bone erosion", "dmard", "methotrexate"
        ]
    },

    # STAGE 4: Diagnosis & Early Treatment (The "Window of Opportunity")
    "Stage 4": {
        "keywords": {
            # Diagnosis
            "acr/eular": 10, "classification criteria": 10, "synovitis": 10, 
            "joint swelling": 10, "bone erosion": 9, "diagnosis": 8, "early ra": 9,
            "ultrasound": 8, "power doppler": 8, "mri": 7, "grading": 6,
            # Treatment
            "window of opportunity": 9, "treat-to-target": 10, "t2t": 10,
            "dmard": 10, "methotrexate": 10, "glucocorticoid": 8, "bridging therapy": 8,
            "steroid": 7, "prednisone": 7, "remission": 9, "low disease activity": 8,
            "das28": 7, "cdai": 7, "liver function": 5, "screening": 5,
            "leflunomide": 8, "sulfasalazine": 8, "hydroxychloroquine": 8
        },
        "negative_keywords": [
            "biologic failure", "jak inhibitor", "end-stage", "joint replacement",
            "palliative", "arthroplasty", "refractory"
        ]
    },

    # STAGE 5: Established / Advanced / Biologics (Escalation & Comorbidities)
    "Stage 5": {
        "keywords": {
            # Biologics & Advanced Meds
            "biologic": 10, "tnf inhibitor": 10, "jak inhibitor": 10, 
            "targeted synthetic": 9, "il-6": 8, "rituximab": 8, "abatacept": 8,
            "switching": 7, "escalation": 7, "refractory": 7,
            "adalimumab": 9, "etanercept": 9, "tofacitinib": 9,
            # Structural & Comorbidities
            "erosion": 10, "joint damage": 9, "radiographic progression": 9,
            "comorbidity": 8, "cardiovascular": 7, "lung disease": 8, "ild": 8,
            "osteoporosis": 7, "fracture": 6, "deformity": 8,
            # Surgery & End Stage
            "surgery": 9, "joint replacement": 10, "arthroplasty": 10, 
            "reconstruction": 8, "disability": 7, "functional impairment": 7,
            "palliative": 8, "rehabilitation": 8, "chronic pain": 7
        },
        "negative_keywords": [
            "early ra", "drug naive", "pre-clinical", "prevention", "at risk",
            "asymptomatic"
        ]
    }
}