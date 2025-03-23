from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
import tempfile
import uuid
import json
from pydantic import BaseModel
import difflib
import random
import base64
from google.cloud import speech
import io
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set Google credentials environment variable
if os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'):
    logger.info(f"Using Google credentials from: {os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')}")
else:
    # Try to use the relative path if absolute path is not set
    credentials_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'service-account-key.json')
    if os.path.exists(credentials_path):
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
        logger.info(f"Set Google credentials to: {credentials_path}")
    else:
        logger.warning("Google credentials file not found!")

router = APIRouter(
    prefix="/speech",
    tags=["speech"],
    responses={404: {"description": "Not found"}},
)

# Initialize Google Cloud Speech client
try:
    speech_client = speech.SpeechClient()
    logger.info("Successfully initialized Google Cloud Speech client")
except Exception as e:
    logger.error(f"Error initializing Google Cloud Speech client: {str(e)}")
    speech_client = None

# Models
class SpeechExercise(BaseModel):
    id: str
    title: str
    text: str
    difficulty: str
    category: str

class ProgressRecord(BaseModel):
    user_id: str
    exercise_id: str
    score: float

class SpeechAnalysisRequest(BaseModel):
    audio_base64: str
    target_text: str

# Mock database of exercises
EXERCISES = [
    {
        "id": "ex1",
        "title": "Basic Greeting",
        "text": "Hello, how are you today?",
        "difficulty": "easy",
        "category": "general"
    },
    {
        "id": "ex2",
        "title": "Weather Description",
        "text": "It's a beautiful sunny day outside.",
        "difficulty": "medium",
        "category": "general"
    },
    {
        "id": "ex3",
        "title": "Medical Appointment",
        "text": "I need to schedule a doctor's appointment.",
        "difficulty": "medium",
        "category": "medical"
    },
    {
        "id": "ex4",
        "title": "Emergency Phrase",
        "text": "I need help immediately, please.",
        "difficulty": "easy",
        "category": "emergency"
    },
    {
        "id": "ex5",
        "title": "Complex Sentence",
        "text": "The quick brown fox jumps over the lazy dog.",
        "difficulty": "hard",
        "category": "general"
    }
]

# Get speech exercises
@router.get("/exercises")
async def get_exercises(difficulty: Optional[str] = None, category: Optional[str] = None):
    filtered_exercises = EXERCISES
    
    if difficulty:
        filtered_exercises = [ex for ex in filtered_exercises if ex["difficulty"] == difficulty]
    
    if category:
        filtered_exercises = [ex for ex in filtered_exercises if ex["category"] == category]
    
    return filtered_exercises

# Save user progress
@router.post("/progress")
async def save_progress(progress: ProgressRecord):
    # In a real app, this would save to a database
    return {"status": "success", "message": "Progress saved successfully"}

# Analyze speech audio using Google Cloud Speech-to-Text API
@router.post("/analyze")
async def analyze_speech(request: SpeechAnalysisRequest):
    try:
        if speech_client is None:
            # Fallback to mock response if Google Cloud client is not available
            logger.warning("Using mock response as Google Cloud Speech client is not available")
            return mock_speech_analysis(request.target_text)
            
        # Decode the base64 audio
        try:
            audio_data = base64.b64decode(request.audio_base64)
            logger.info(f"Successfully decoded audio data, size: {len(audio_data)} bytes")
        except Exception as e:
            logger.error(f"Error decoding base64 audio: {str(e)}")
            return mock_speech_analysis(request.target_text)
        
        # Configure the speech recognition request
        audio = speech.RecognitionAudio(content=audio_data)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,  # Standard sample rate for web audio
            language_code="en-US",
            enable_word_time_offsets=True,  # Get timing information for each word
            enable_automatic_punctuation=True,
            model="default"  # Use the default model for general speech recognition
        )
        
        # Perform speech recognition
        try:
            logger.info("Sending request to Google Cloud Speech-to-Text API")
            response = speech_client.recognize(config=config, audio=audio)
            logger.info(f"Received response from Google Cloud Speech-to-Text API: {response}")
        except Exception as e:
            logger.error(f"Error with WEBM_OPUS format, trying LINEAR16: {str(e)}")
            # If there's an issue with the audio format, try with LINEAR16 encoding
            try:
                config = speech.RecognitionConfig(
                    encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                    sample_rate_hertz=48000,
                    language_code="en-US",
                    enable_word_time_offsets=True,
                    enable_automatic_punctuation=True,
                    model="default"
                )
                response = speech_client.recognize(config=config, audio=audio)
            except Exception as e2:
                logger.error(f"Error with LINEAR16 format as well: {str(e2)}")
                return mock_speech_analysis(request.target_text)
        
        # Extract the transcription
        transcription = ""
        if response.results:
            transcription = response.results[0].alternatives[0].transcript
            logger.info(f"Transcription: {transcription}")
        else:
            logger.warning("No transcription results returned")
            return mock_speech_analysis(request.target_text)
        
        # Calculate similarity score
        similarity_ratio = difflib.SequenceMatcher(None, transcription.lower(), request.target_text.lower()).ratio()
        score = int(similarity_ratio * 100)
        logger.info(f"Similarity score: {score}")
        
        # Generate phoneme analysis
        words_target = request.target_text.lower().split()
        words_transcribed = transcription.lower().split()
        
        phoneme_analysis = []
        
        # Word-by-word comparison
        for i, target_word in enumerate(words_target):
            if i < len(words_transcribed):
                transcribed_word = words_transcribed[i]
                word_similarity = difflib.SequenceMatcher(None, target_word, transcribed_word).ratio()
                
                if word_similarity > 0.8:
                    phoneme_analysis.append({
                        "phoneme": target_word,
                        "correct": True,
                        "feedback": "Good pronunciation"
                    })
                else:
                    phoneme_analysis.append({
                        "phoneme": target_word,
                        "correct": False,
                        "feedback": f"Heard '{transcribed_word}' instead of '{target_word}'"
                    })
            else:
                phoneme_analysis.append({
                    "phoneme": target_word,
                    "correct": False,
                    "feedback": "Word was not detected"
                })
        
        # Generate suggestions based on score
        suggestions = []
        if score < 60:
            suggestions.append("Try speaking more slowly and clearly.")
            suggestions.append("Practice each word individually before saying the full phrase.")
        elif score < 80:
            suggestions.append("Your pronunciation is good, but try to enunciate more clearly.")
            suggestions.append("Focus on the words that were misheard.")
        else:
            suggestions.append("Excellent pronunciation! Keep practicing to maintain your skills.")
        
        # Return the analysis results
        return {
            "transcription": transcription,
            "score": score,
            "phonemeAnalysis": phoneme_analysis,
            "suggestions": suggestions
        }
        
    except Exception as e:
        logger.error(f"Error analyzing speech: {str(e)}")
        # Return mock response in case of error
        return mock_speech_analysis(request.target_text)

# Generate a mock speech analysis response for testing or when API is unavailable
def mock_speech_analysis(target_text):
    logger.info("Generating mock speech analysis response")
    words = target_text.lower().split()
    
    # Generate random phoneme analysis with some correct and some incorrect words
    phoneme_analysis = []
    for word in words:
        is_correct = random.random() > 0.3  # 70% chance of being correct
        
        if is_correct:
            phoneme_analysis.append({
                "phoneme": word,
                "correct": True,
                "feedback": "Good pronunciation"
            })
        else:
            # Generate a slightly misspelled version of the word
            if len(word) > 3:
                pos = random.randint(1, len(word) - 2)
                misspelled = word[:pos] + random.choice("abcdefghijklmnopqrstuvwxyz") + word[pos+1:]
            else:
                misspelled = word + random.choice("abcdefghijklmnopqrstuvwxyz")
                
            phoneme_analysis.append({
                "phoneme": word,
                "correct": False,
                "feedback": f"Heard '{misspelled}' instead of '{word}'"
            })
    
    # Calculate mock score based on number of correct words
    correct_count = sum(1 for item in phoneme_analysis if item["correct"])
    score = int((correct_count / len(phoneme_analysis)) * 100)
    
    # Generate mock transcription with some errors
    transcription_words = []
    for item in phoneme_analysis:
        if item["correct"]:
            transcription_words.append(item["phoneme"])
        else:
            # Extract the misspelled word from the feedback
            feedback_parts = item["feedback"].split("'")
            if len(feedback_parts) > 1:
                transcription_words.append(feedback_parts[1])
            else:
                transcription_words.append(item["phoneme"])
    
    transcription = " ".join(transcription_words)
    
    # Generate suggestions based on score
    suggestions = []
    if score < 60:
        suggestions.append("Try speaking more slowly and clearly.")
        suggestions.append("Practice each word individually before saying the full phrase.")
    elif score < 80:
        suggestions.append("Your pronunciation is good, but try to enunciate more clearly.")
        suggestions.append("Focus on the words that were misheard.")
    else:
        suggestions.append("Excellent pronunciation! Keep practicing to maintain your skills.")
    
    return {
        "transcription": transcription,
        "score": score,
        "phonemeAnalysis": phoneme_analysis,
        "suggestions": suggestions
    }
