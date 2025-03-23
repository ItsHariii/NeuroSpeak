from fastapi import FastAPI
from routes import auth, emoji_click, recommend, user

app = FastAPI(title="NeuroSpeak API")

app.include_router(auth.router)
app.include_router(emoji_click.router)
app.include_router(recommend.router)
app.include_router(user.router)