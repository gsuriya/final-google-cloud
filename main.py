from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
import uuid
import asyncio
from PIL import Image
import io
from collections import Counter
from typing import Optional
import logging
from fastapi.middleware.cors import CORSMiddleware

# Import our ADK agents
from adk_fashion_agent import (
    fashion_stylist_agent,
    skin_tone_analysis_agent,
    interact_with_fashion_agent,
    interact_with_skin_tone_agent,
    classify_intent_with_agent,
    extract_filter_with_agent
)
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Fashion ADK API", description="Fashion stylist powered by Google ADK")

# Add CORS middleware to allow requests from your Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize fashion agent runner and session service
app_name = f"FashionStylistApp-{uuid.uuid4()}"
session_service = InMemorySessionService()
runner = Runner(agent=fashion_stylist_agent, app_name=app_name, session_service=session_service)

# Initialize skin tone analysis agent runner
skin_tone_app_name = f"SkinToneAnalysisApp-{uuid.uuid4()}"
skin_tone_session_service = InMemorySessionService()
skin_tone_runner = Runner(agent=skin_tone_analysis_agent, app_name=skin_tone_app_name, session_service=skin_tone_session_service)

logger.info(f"Fashion ADK server initialized with app name: {app_name}")
logger.info(f"Skin tone analysis app initialized with app name: {skin_tone_app_name}")

class ChatRequest(BaseModel):
    user_id: str
    session_id: str
    message: str

class IntentRequest(BaseModel):
    transcript: str

class FilterRequest(BaseModel):
    transcript: str

@app.get("/")
async def root():
    return {"message": "Fashion ADK API is running! 💅✨", "agents": ["FashionStylist", "IntentClassifier", "FilterExtraction"]}

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """Chat with the fashion stylist agent"""
    try:
        logger.info(f"Chat request from user {req.user_id}: {req.message}")
        response = await interact_with_fashion_agent(
            app_name, req.user_id, req.session_id, req.message, session_service, runner
        )
        return {"response": response}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"response": f"Oops! Fashion emergency! 💅 Something went wrong: {str(e)}"}

@app.post("/classify-intent")
async def classify_intent_endpoint(req: IntentRequest):
    """Classify user intent from transcript"""
    try:
        logger.info(f"Intent classification request: {req.transcript}")
        intent = await classify_intent_with_agent(req.transcript)
        logger.info(f"Classified intent: {intent}")
        return {"intent": intent}
    except Exception as e:
        logger.error(f"Intent classification error: {e}")
        return {"intent": "chat"}

@app.post("/color-analysis")
async def color_analysis(
    file: UploadFile = File(...),
    transcript: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
):
    """Analyze color from uploaded image with optional transcript context"""
    try:
        # If transcript is provided, classify intent first
        if transcript:
            intent = await classify_intent_with_agent(transcript)
            if intent != "skin_tone_analysis":
                # Fallback to chat agent
                chat_response = await interact_with_fashion_agent(
                    app_name,
                    user_id or "color_user",
                    session_id or "color_session",
                    transcript,
                    session_service,
                    runner
                )
                return {"response": chat_response, "intent": intent}

        # Process the image for color analysis
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image = image.resize((100, 100))
        pixels = list(image.getdata())
        most_common = Counter(pixels).most_common(1)[0][0]
        dominant_hex = '#%02x%02x%02x' % most_common

        logger.info(f"Color analysis result: {dominant_hex}")
        return {"dominant_color": dominant_hex, "intent": "skin_tone_analysis"}

    except Exception as e:
        logger.error(f"Color analysis error: {e}")
        return {"error": f"Color analysis failed: {str(e)}"}

@app.post("/skin-tone-analysis")
async def skin_tone_analysis_endpoint(req: ChatRequest):
    """Analyze skin tone and provide color recommendations using the specialized agent"""
    try:
        logger.info(f"Skin tone analysis request from user {req.user_id}: {req.message}")
        response = await interact_with_skin_tone_agent(
            skin_tone_app_name, req.user_id, req.session_id, req.message, skin_tone_session_service, skin_tone_runner
        )
        return {"response": response, "intent": "skin_tone_analysis"}
    except Exception as e:
        logger.error(f"Skin tone analysis error: {e}")
        return {"response": f"Oops! Color analysis emergency! 🎨 Something went wrong: {str(e)}", "intent": "skin_tone_analysis"}

@app.post("/extract-filter")
async def extract_filter_endpoint(req: FilterRequest):
    """Extract filter information from transcript"""
    try:
        logger.info(f"Filter extraction request: {req.transcript}")
        result = await extract_filter_with_agent(req.transcript)
        logger.info(f"Filter extraction result: {result}")
        return result
    except Exception as e:
        logger.error(f"Filter extraction error: {e}")
        return {"type": "unknown", "value": "", "error": str(e)}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Fashion ADK API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
