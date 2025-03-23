import os
from google.cloud import texttospeech
from dotenv import load_dotenv

load_dotenv()

client = texttospeech.TextToSpeechClient()

def synthesize_pronunciation(word: str, filename="output.mp3") -> str:
    synthesis_input = texttospeech.SynthesisInput(text=word)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )

    path = os.path.join("static", filename)
    os.makedirs("static", exist_ok=True)
    with open(path, "wb") as out:
        out.write(response.audio_content)

    return f"/static/{filename}"  # You can serve this file from FastAPI