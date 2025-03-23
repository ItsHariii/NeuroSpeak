from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import os
import tempfile
import uuid
import base64
from google.cloud import texttospeech
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
    prefix="/tts",
    tags=["tts"],
    responses={404: {"description": "Not found"}},
)

# Initialize Google Cloud Text-to-Speech client
try:
    tts_client = texttospeech.TextToSpeechClient()
    logger.info("Successfully initialized Google Cloud Text-to-Speech client")
except Exception as e:
    logger.error(f"Error initializing Google Cloud Text-to-Speech client: {str(e)}")
    tts_client = None

class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-Neural2-F"  # Default voice
    speaking_rate: float = 1.0
    pitch: float = 0.0

@router.post("")
async def text_to_speech(request: TTSRequest):
    try:
        if tts_client is None:
            # Fallback to mock response if Google Cloud client is not available
            logger.warning("Using mock TTS response as Google Cloud TTS client is not available")
            return generate_mock_audio_response(request.text)
            
        # Set up the TTS request
        synthesis_input = texttospeech.SynthesisInput(text=request.text)
        
        # Parse the voice name
        voice_parts = request.voice.split("-")
        if len(voice_parts) < 3:
            # Default to US English female voice if format is incorrect
            language_code = "en-US"
            name = "en-US-Neural2-F"
            ssml_gender = texttospeech.SsmlVoiceGender.FEMALE
            logger.info(f"Using default voice: {name}")
        else:
            language_code = f"{voice_parts[0]}-{voice_parts[1]}"
            name = request.voice
            # Determine gender from voice name
            if "Female" in request.voice or "F" in voice_parts[2]:
                ssml_gender = texttospeech.SsmlVoiceGender.FEMALE
            else:
                ssml_gender = texttospeech.SsmlVoiceGender.MALE
            logger.info(f"Using specified voice: {name}")
        
        # Configure voice
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=name,
            ssml_gender=ssml_gender
        )
        
        # Configure audio output
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=request.speaking_rate,
            pitch=request.pitch
        )
        
        # Generate speech
        logger.info(f"Sending TTS request for text: '{request.text[:50]}...' (truncated)")
        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        logger.info(f"Received TTS response, audio size: {len(response.audio_content)} bytes")
        
        # Return the audio content
        return Response(
            content=response.audio_content,
            media_type="audio/mp3",
            headers={"Content-Disposition": f"attachment; filename=tts_{uuid.uuid4()}.mp3"}
        )
        
    except Exception as e:
        logger.error(f"Error generating speech: {str(e)}")
        # Return mock audio response in case of error
        return generate_mock_audio_response(request.text)

# Generate a mock audio response for testing or when API is unavailable
def generate_mock_audio_response(text):
    logger.info("Generating mock TTS response")
    
    try:
        # Try to load a sample MP3 file if available
        sample_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static', 'sample.mp3')
        
        if os.path.exists(sample_path):
            with open(sample_path, 'rb') as f:
                audio_content = f.read()
                logger.info(f"Using sample audio file: {sample_path}")
        else:
            # Generate a minimal valid MP3 file (ID3 tag only)
            # This is just a placeholder and won't actually play any sound
            logger.warning("Sample audio file not found, generating minimal MP3")
            audio_content = b'\xFF\xFB\x90\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
        
        return Response(
            content=audio_content,
            media_type="audio/mp3",
            headers={"Content-Disposition": f"attachment; filename=tts_mock_{uuid.uuid4()}.mp3"}
        )
    except Exception as e:
        logger.error(f"Error generating mock audio: {str(e)}")
        # Return an empty response with error headers
        return Response(
            content=b'',
            media_type="audio/mp3",
            headers={
                "Content-Disposition": f"attachment; filename=tts_error_{uuid.uuid4()}.mp3",
                "X-Error": "Failed to generate audio"
            }
        )
