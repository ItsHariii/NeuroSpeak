import os
from google.cloud import firestore
from dotenv import load_dotenv

load_dotenv()

db = firestore.Client()

def save_emoji_click(event):
    doc_ref = db.collection("emoji_clicks").document()
    doc_ref.set({
        "user_id": event.user_id,
        "emoji": event.emoji,
        "timestamp": event.timestamp.isoformat()
    })

def get_user_emoji_clicks(user_id):
    clicks_ref = db.collection("emoji_clicks").where("user_id", "==", user_id)
    return [doc.to_dict() for doc in clicks_ref.stream()]