from pydantic import BaseModel
from datetime import datetime

class EmojiClickEvent(BaseModel):
    user_id: str
    emoji: str
    timestamp: datetime