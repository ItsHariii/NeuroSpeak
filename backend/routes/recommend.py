from fastapi import APIRouter, Query
from logic.recommend_engine import get_recommended_emojis

router = APIRouter()

@router.get("/recommend")
def recommend_emojis(user_id: str = Query(...)):
    return {"recommended": get_recommended_emojis(user_id)}