from fastapi import APIRouter
from schemas.user import User

router = APIRouter()

@router.get("/user/{user_id}", response_model=User)
def get_user(user_id: str):
    return {
        "user_id": user_id,
        "name": "Test User",
        "email": "test@example.com"
    }