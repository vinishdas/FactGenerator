# backend/app/services/scoring.py
import re

def score_sentence(text: str, stage_config: dict) -> float:
    text_lower = text.lower()
    score = 0.0
    
    # 1. Immediate Disqualification (Boilerplate)
    for term in ["click", "subscribe", "cookie", "policy"]:
        if term in text_lower: return -100.0

    # 2. Keyword Scoring
    keywords = stage_config.get("keywords", {})
    for word, weight in keywords.items():
        if word in text_lower:
            score += weight

    # 3. Negative Keyword Penalty (Wrong Stage)
    negatives = stage_config.get("negative_keywords", [])
    for word in negatives:
        if word in text_lower:
            score -= 5.0  # Heavy penalty for wrong stage info

    # 4. Length Heuristic (Too short = useless, Too long = noise)
    word_count = len(text.split())
    if word_count < 5: score -= 10
    if word_count > 35: score -= 2

    return score