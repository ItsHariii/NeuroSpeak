import difflib
from typing import Dict, List

def get_syllables(word: str) -> List[str]:
    """Basic syllable separation - this could be enhanced with a proper NLP library"""
    vowels = 'aeiouy'
    word = word.lower()
    syllables = []
    current = ""
    
    for i, char in enumerate(word):
        current += char
        if char in vowels and (i == len(word)-1 or word[i+1] not in vowels):
            syllables.append(current)
            current = ""
        elif char not in vowels and current and current[-1] in vowels:
            syllables.append(current)
            current = char
    
    if current:
        if len(syllables) > 0:
            syllables[-1] += current
        else:
            syllables.append(current)
    
    return syllables

def compare_words(expected: str, spoken: str) -> Dict:
    expected = expected.lower().strip()
    spoken = spoken.lower().strip()

    if expected == spoken:
        return {
            "status": "perfect",
            "message": "Perfect! You pronounced it correctly.",
            "syllable_feedback": [],
            "score": 100
        }

    expected_syllables = get_syllables(expected)
    spoken_syllables = get_syllables(spoken)
    
    syllable_feedback = []
    total_score = 0
    
    # Compare each syllable
    for i, exp_syl in enumerate(expected_syllables):
        if i < len(spoken_syllables):
            matcher = difflib.SequenceMatcher(None, exp_syl, spoken_syllables[i])
            ratio = matcher.ratio()
            score = int(ratio * 100)
            total_score += score
            
            if ratio > 0.8:
                status = "good"
            elif ratio > 0.5:
                status = "needs_work"
            else:
                status = "poor"
                
            syllable_feedback.append({
                "syllable": exp_syl,
                "status": status,
                "score": score
            })
        else:
            syllable_feedback.append({
                "syllable": exp_syl,
                "status": "missing",
                "score": 0
            })
    
    # Calculate final score
    final_score = total_score // len(expected_syllables)
    
    # Generate overall feedback
    if final_score > 80:
        status = "good"
        message = "Very good! Just a few minor improvements needed."
    elif final_score > 50:
        status = "needs_work"
        message = "Keep practicing! Focus on the highlighted syllables."
    else:
        status = "poor"
        message = "Let's break this down and practice each syllable."
        
    return {
        "status": status,
        "message": message,
        "syllable_feedback": syllable_feedback,
        "score": final_score
    }