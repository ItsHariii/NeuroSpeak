from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, emoji_click, recommend, user, practice, speech, tts
from fastapi.staticfiles import StaticFiles
import os
import logging
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Get port from environment or use default
PORT = int(os.getenv("PORT", 8083))

# Create FastAPI app
app = FastAPI(title="NeuroSpeak API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(auth.router)
app.include_router(emoji_click.router)
app.include_router(recommend.router)
app.include_router(user.router)
app.include_router(practice.router)
app.include_router(speech.router)
app.include_router(tts.router)

# Mount static files
try:
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)
        logger.info(f"Created static directory: {static_dir}")
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"Mounted static files from: {static_dir}")
except Exception as e:
    logger.error(f"Failed to mount static files: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Welcome to NeuroSpeak API", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Run the application
if __name__ == "__main__":
    logger.info(f"Starting NeuroSpeak API on port {PORT}")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)