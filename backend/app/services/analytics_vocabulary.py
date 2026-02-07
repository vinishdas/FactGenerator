# app/services/analytics_vocabulary.py

# IMPROVED VOCABULARY FOR ROBUST DETECTION
# Includes specific drug names, clinical scales, and layman terms.

STAGE_ANALYTICS_CONFIG = {
    "Stage 1": {
        "topics": {
            "T1": {"name": "Genetic Susceptibility", "keywords": ["genetic", "susceptibility", "hla-drb1", "shared epitope", "family history", "polygenic", "heritability", "predisposition", "first-degree relative", "twin study"]},
            "T2": {"name": "Environmental Risks", "keywords": ["smoking", "silica", "dust", "pollution", "periodontal", "gum disease", "lifestyle", "environmental", "microbiome", "obesity", "bmi"]},
            "T3": {"name": "Gene-Environment", "keywords": ["interaction", "gene-environment", "cumulative risk", "multi-factorial", "trigger", "epigenetic", "hit hypothesis"]},
            "T4": {"name": "Early Immune Priming", "keywords": ["immune priming", "mucosa", "microbiome", "lung", "gut", "oral", "pre-autoantibody", "dysregulation", "molecular mimicry"]},
            "T5": {"name": "Risk Quantification", "keywords": ["absolute risk", "relative risk", "lifetime risk", "prediction", "estimate", "baseline", "odds ratio", "hazard ratio"]},
            "T6": {"name": "Boundary Definition", "keywords": ["preclinical", "asymptomatic", "not diagnosis", "false positive", "overdiagnosis", "at-risk", "pre-ra"]},
            "T7": {"name": "Monitoring Concepts", "keywords": ["watchful waiting", "surveillance", "symptom awareness", "when to seek", "screening", "check-up"]},
            "T8": {"name": "Prevention (Non-Drug)", "keywords": ["cessation", "modification", "prevention", "reduction", "non-pharmacologic", "diet", "exercise", "Mediterranean"]},
            "T9": {"name": "Asian Context", "keywords": ["asian", "singapore", "ethnicity", "prevalence asia", "incidence", "chinese", "malay", "indian", "genetics asian"]},
            "T10": {"name": "Transition Signals", "keywords": ["progression", "warning signs", "transition", "autoantibody development", "onset", "symptom emergence"]}
        },
        "functions": {
            "Medical Education": ["textbook", "medical student", "curriculum", "physiology", "pathogenesis", "mechanism"],
            "Guideline Framing": ["guideline", "consensus", "recommendation", "criteria", "eular", "acr"],
            "Epidemiology": ["prevalence", "incidence", "population", "demographics", "statistics", "cohort"],
            "Risk Explanation": ["prognosis", "likelihood", "odds", "probability", "predictive model"],
            "Prevention Evidence": ["cessation", "intervention", "reduction", "avoidance", "trial"],
            "Monitoring Concepts": ["follow-up", "schedule", "check-up", "observation", "longitudinal"],
            "Diagnostic Clarity": ["rule out", "differential", "distinguish", "mimic", "specificity"],
            "Patient Education": ["brochure", "guide", "living with", "understanding", "what to expect", "support"],
            "Stage Transition": ["trigger", "progression", "next stage", "conversion", "evolution"]
        }
    },
    "Stage 2": {
        "topics": {
            "T1": {"name": "Systemic Autoimmunity", "keywords": ["systemic autoimmunity", "autoantibody positive", "asymptomatic", "pre-synovitis", "immune activation", "loss of tolerance"]},
            "T2": {"name": "Autoantibodies", "keywords": ["acpa", "anti-ccp", "rheumatoid factor", "rf", "titer", "seropositive", "isotype", "anti-carp", "biomarker"]},
            "T3": {"name": "Biomarker Limits", "keywords": ["false positive", "predictive value", "limitation", "uncertainty", "interpretation", "sensitivity", "specificity"]},
            "T4": {"name": "Immunopathogenesis", "keywords": ["cytokine", "b-cell", "loss of tolerance", "pathway", "dysregulation", "activation", "t-cell", "synovial"]},
            "T5": {"name": "Risk Stratification", "keywords": ["stratification", "probability", "predictor", "score", "model", "likelihood", "nomogram"]},
            "T6": {"name": "Subclinical Inflammation", "keywords": ["subclinical", "inflammation", "pre-synovitis", "without symptoms", "mri inflammation", "ultrasound synovitis"]},
            "T7": {"name": "Surveillance", "keywords": ["monitoring", "watchful waiting", "longitudinal", "follow-up", "interval"]},
            "T8": {"name": "Symptoms & CSA", "keywords": ["arthralgia", "csa", "clinically suspect", "joint symptoms", "early pain", "stiffness"]},
            "T9": {"name": "Risk Modification", "keywords": ["lifestyle", "smoking", "periodontal", "modifiable", "non-pharmacologic", "dietary"]},
            "T10": {"name": "Patient Education", "keywords": ["counseling", "communication", "anxiety", "explanation", "understanding", "coping"]},
            "T11": {"name": "Asian Context", "keywords": ["asian", "singapore", "ethnicity", "chinese", "malay", "indian", "local"]},
            "T12": {"name": "Transition Signals", "keywords": ["transition", "progression", "warning", "trigger", "onset", "imminent"]}
        },
        "functions": {
            "Medical Education": ["textbook", "education", "mechanism", "pathology"],
            "Guideline Framing": ["consensus", "guideline", "standard", "task force"],
            "Epidemiology": ["prevalence", "statistics", "population", "demographic"],
            "Risk Explanation": ["risk", "prediction", "chance", "probability"],
            "Prevention Evidence": ["prevention", "lifestyle", "modification", "cessation"],
            "Monitoring Concepts": ["surveillance", "monitoring", "tracking", "schedule"],
            "Diagnostic Clarity": ["diagnosis", "testing", "interpretation", "results"],
            "Patient Education": ["patient", "information", "support", "help"],
            "Stage Transition": ["progression", "conversion", "development", "onset"],
            "Nutrition": ["diet", "food", "nutrition", "supplement", "vitamin"],
            "Lifestyle": ["exercise", "stress", "sleep", "habit", "smoking"]
        }
    },
    "Stage 3": {
        "topics": {
            "T1": {"name": "CSA Definition", "keywords": ["clinically suspect arthralgia", "csa", "eular criteria", "suspicious", "pre-ra", "definition"]},
            "T2": {"name": "Symptom Patterns", "keywords": ["stiffness", "morning stiffness", "small joint", "symmetric", "nocturnal", "pattern", "hand pain", "metatarsal"]},
            "T3": {"name": "Differential Diagnosis", "keywords": ["differential", "fibromyalgia", "osteoarthritis", "viral", "mimic", "mechanical", "psoriatic"]},
            "T4": {"name": "Biomarkers in CSA", "keywords": ["acpa positive", "rf positive", "predictive value", "titer", "serology", "antibody profile"]},
            "T5": {"name": "Progression Risk", "keywords": ["progression", "time to onset", "probability", "model", "stratification", "prediction rule"]},
            "T6": {"name": "Imaging Concepts", "keywords": ["ultrasound", "mri", "doppler", "edema", "subclinical synovitis", "imaging", "erosions"]},
            "T7": {"name": "Monitoring Pathways", "keywords": ["referral", "pathway", "surveillance", "reassess", "follow-up", "rheumatologist"]},
            "T8": {"name": "Specialist Thresholds", "keywords": ["rheumatology", "referral", "red flag", "escalation", "criteria", "triage"]},
            "T9": {"name": "Patient Education", "keywords": ["expectation", "anxiety", "counseling", "self-diagnosis", "information", "reassurance"]},
            "T10": {"name": "Functional Impact", "keywords": ["function", "limitation", "work", "daily life", "disability", "quality of life", "grip"]},
            "T11": {"name": "Asian Context", "keywords": ["asian", "singapore", "ethnicity", "population", "local"]},
            "T12": {"name": "Transition to RA", "keywords": ["diagnosis", "classification", "onset", "synovitis", "development", "clinical arthritis"]}
        },
        "functions": {
            "Medical Education": ["textbook", "clinical", "teaching", "signs"],
            "Guideline Framing": ["eular", "acr", "criteria", "recommendation"],
            "Epidemiology": ["incidence", "cohort", "study", "data"],
            "Risk Explanation": ["prognosis", "outcome", "prediction", "risk"],
            "Prevention Evidence": ["intervention", "trial", "evidence", "study"],
            "Monitoring Concepts": ["schedule", "frequency", "visit", "monitor"],
            "Diagnostic Clarity": ["rule in", "rule out", "confirm", "investigate"],
            "Patient Education": ["guide", "leaflet", "explain", "understand"],
            "Stage Transition": ["diagnosis", "progression", "onset", "develop"],
            "Nutrition": ["diet", "anti-inflammatory", "food", "omega-3"],
            "Lifestyle": ["activity", "coping", "ergonomics", "rest"]
        }
    },
    "Stage 4": {
        "topics": {
            "T1": {"name": "ACR/EULAR Classification", "keywords": ["acr/eular", "classification criteria", "diagnosed ra", "classification", "score", "2010 criteria", "sensitivity"]},
            "T2": {"name": "Clinical Synovitis Detection", "keywords": ["synovitis", "swollen", "tender", "joint count", "physical exam", "das28", "effusion"]},
            "T3": {"name": "Window of Opportunity", "keywords": ["window of opportunity", "early intervention", "aggressive", "prevention", "erosion", "delay"]},
            "T4": {"name": "DMARD Initiation", "keywords": ["dmard", "methotrexate", "initiation", "first-line", "folic acid", "leflunomide", "sulfasalazine", "hydroxychloroquine", "anchor drug"]},
            "T5": {"name": "Glucocorticoid Bridging", "keywords": ["bridging", "glucocorticoid", "steroid", "prednisone", "short-term", "taper", "injection"]},
            "T6": {"name": "Treat-to-Target (T2T)", "keywords": ["treat-to-target", "t2t", "remission", "low disease activity", "target", "tight control"]},
            "T7": {"name": "Ultrasound Grading", "keywords": ["ultrasound", "grading", "power doppler", "gray scale", "imaging", "synovial hypertrophy"]},
            "T8": {"name": "Patient Impact", "keywords": ["psychological", "impact", "counseling", "outlook", "diagnosis", "depression", "fatigue"]}
        },
        "functions": {
            "Diagnostic Classification": ["confirm ra", "criteria", "diagnosis", "points", "classify"],
            "Treatment Protocol Framing": ["protocol", "dosing", "schedule", "titration", "guideline", "algorithm"],
            "Bridge Therapy Guidance": ["manage symptoms", "waiting", "efficacy", "bridge", "relief"],
            "Disease Activity Monitoring": ["das28", "cdai", "sdai", "monitoring", "measure", "score"],
            "Imaging for Synovitis": ["mri", "ultrasound", "objective", "inflammation level", "scan"],
            "Patient Education": ["education", "understanding", "necessity", "side-effect", "adherence"],
            "Safety & Screening": ["screening", "tb", "liver function", "hepatitis", "safety", "contraindication"]
        }
    },
    "Stage 5": {
        "topics": {
            "T1": {"name": "Biologic & JAKi", "keywords": ["biologic", "tnf", "jak", "inhibitor", "targeted", "adalimumab", "etanercept", "tofacitinib", "rituximab", "abatacept"]},
            "T2": {"name": "Radiographic Erosion", "keywords": ["erosion", "radiographic", "damage", "x-ray", "sharp score", "joint space narrowing", "structural"]},
            "T3": {"name": "Extra-Articular", "keywords": ["lung", "heart", "eye", "nodules", "vasculitis", "extra-articular", "ild", "sjogren", "felty"]},
            "T4": {"name": "Comorbidities", "keywords": ["osteoporosis", "cardiovascular", "ild", "lung disease", "fracture", "infection", "malignancy"]},
            "T5": {"name": "Flare Management", "keywords": ["flare", "distinguishing", "active disease", "damage", "relapse", "worsening"]},
            "T6": {"name": "Surgical Interventions", "keywords": ["surgery", "replacement", "arthroplasty", "reconstruction", "synovectomy", "orthopedic"]},
            "T7": {"name": "Disability & Work", "keywords": ["disability", "work", "impairment", "quality of life", "accommodation", "vocational", "adl"]},
            "T8": {"name": "Palliative Care", "keywords": ["palliative", "rehabilitative", "support", "deformity", "pain", "chronic pain", "management"]}
        },
        "functions": {
            "Biologic Escalation": ["switching", "escalation", "failure", "class", "refractory"],
            "Comorbidity Management": ["secondary", "impact", "risk", "management", "screening"],
            "Structural Damage Assessment": ["interpreting", "data", "integrity", "progression", "radiograph"],
            "Surgical Evaluation": ["referral", "orthopedic", "transition", "replacement", "consult"],
            "Functional Rehabilitation": ["physiotherapy", "occupational", "daily living", "adl", "exercise"],
            "Safety Surveillance": ["long-term", "adverse", "malignancy", "infection", "monitoring"],
            "Palliative Care": ["pain management", "fatigue", "psychological", "non-reversible", "comfort"]
        }
    }
}