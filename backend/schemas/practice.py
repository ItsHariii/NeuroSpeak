from pydantic import BaseModel
from typing import List, Dict

class SyllableFeedback(BaseModel):
    syllable: str
    status: str
    score: int

class WordPracticeFeedback(BaseModel):
    expected: str
    spoken: str
    feedback: str
    syllable_feedback: List[SyllableFeedback]
    score: int
    status: str
    tts_audio: str

class PracticeSessionResult(BaseModel):
    total_score: float
    num_exercises: int
    improvement_tips: List[str]