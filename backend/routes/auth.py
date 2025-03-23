from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from services.google_oauth import get_google_oauth_url, exchange_code_for_tokens, decode_google_id_token
from urllib.parse import urlencode
import os

router = APIRouter()


@router.get("/auth/login")
def login():
    params = urlencode({
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
        "response_type": "code",
        "scope": "openid email profile",  # ⬅️ critical!
        "access_type": "offline",
        "prompt": "consent"
    })
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")

@router.get("/auth/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")
    tokens = await exchange_code_for_tokens(code)
    user_info = decode_google_id_token(tokens["id_token"])
    return {"user": user_info}