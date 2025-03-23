from fastapi import APIRouter, UploadFile, Form, Body
from typing import List, Dict
from services.speech_to_text import transcribe_audio
from utils.speech_analysis import compare_words
from schemas.practice import WordPracticeFeedback, PracticeSessionResult
from services.text_to_speech import synthesize_pronunciation

router = APIRouter()

@router.post("/practice/word-check", response_model=WordPracticeFeedback)
async def check_pronunciation(word: str = Form(...), audio: UploadFile = Form(...)):
    audio_bytes = await audio.read()
    transcript = transcribe_audio(audio_bytes)
    feedback = compare_words(word, transcript)
    audio_url = synthesize_pronunciation(word, filename=f"{word}.mp3")

    return WordPracticeFeedback(
        expected=word,
        spoken=transcript,
        feedback=feedback["message"],
        syllable_feedback=feedback["syllable_feedback"],
        score=feedback["score"],
        status=feedback["status"],
        tts_audio=audio_url
    )

@router.post("/practice/session-complete")
async def complete_session(results: List[Dict] = Body(...)):
    total_score = sum(result["score"] for result in results) / len(results)
    
    # Generate personalized tips based on performance
    tips = []
    if total_score < 60:
        tips = [
            "Break down words into syllables and practice each part separately",
            "Listen to the correct pronunciation multiple times before attempting",
            "Record yourself and compare with the original audio",
            "Focus on one sound at a time until you master it"
        ]
    elif total_score < 80:
        tips = [
            "Pay attention to the syllables marked as 'needs work'",
            "Practice the challenging sounds in different word contexts",
            "Try speaking more slowly to improve accuracy"
        ]
    else:
        tips = [
            "Keep practicing to maintain your progress",
            "Try more challenging words",
            "Work on speaking at a natural pace while maintaining accuracy"
        ]
    
    return PracticeSessionResult(
        total_score=total_score,
        num_exercises=len(results),
        improvement_tips=tips
    )