from pydantic import BaseModel
from typing import List

class EmojiRecommendation(BaseModel):
    recommended: List[str]