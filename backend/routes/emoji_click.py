from fastapi import APIRouter
from schemas.emoji_click import EmojiClickEvent
from services.firestore import save_emoji_click

router = APIRouter()

@router.post("/emoji/click")
def track_emoji_click(event: EmojiClickEvent):
    save_emoji_click(event)
    return {"status": "saved"}