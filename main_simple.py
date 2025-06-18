from fastapi import FastAPI
from pydantic import BaseModel
import logging
from fastapi.middleware.cors import CORSMiddleware

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Fashion API (Simple)", description="Fashion stylist API without ADK")

# Add CORS middleware to allow requests from your Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str
    session_id: str
    message: str

class IntentRequest(BaseModel):
    transcript: str

@app.get("/")
async def root():
    return {"message": "Fashion API is running! 💅✨ (Simple version without ADK)", "status": "ready"}

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """Simple chat endpoint that returns fashionista responses without ADK"""
    try:
        logger.info(f"Chat request from user {req.user_id}: {req.message}")

        # Simple fashionista responses based on keywords
        message_lower = req.message.lower()

        if "color" in message_lower or "analysis" in message_lower:
            response = "OMG yes! I'd love to help with your color analysis! 🌈✨ You should totally use the Analyze button to take a photo so I can see your gorgeous features and give you personalized color recs! 💅"
        elif "style" in message_lower:
            response = "Babe, you're asking the right questions! 💃 Tell me more about your vibe - are you feeling edgy, classic, boho, or something totally unique? I'm here to help you slay! ✨👑"
        elif "outfit" in message_lower:
            response = "Yasss, outfit planning is my jam! 🔥 What's the occasion? Date night? Work meeting? Casual hangout? Let's put together something that screams YOU! 💅✨"
        elif "trend" in message_lower:
            response = "Honey, the trends right now are SO good! 🎊 Think oversized blazers, statement accessories, and mixing textures! But remember, the best trend is confidence! 💃👑"
        elif "hello" in message_lower or "hi" in message_lower:
            response = "Hey gorgeous! 👋✨ I'm FASHIONISTA, your AI style bestie! Ready to make some fashion magic happen? What's on your mind today? 💅🎉"
        else:
            response = f"Love that question! 💕 While I'm still getting my full fashion powers ready, I'm here to chat about all things style! What specifically are you curious about? Colors, outfits, trends? Let's talk fashion! ✨👗"

        return {"response": response}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"response": f"Oops! Fashion emergency! 💅 Something went wrong: {str(e)}"}

@app.post("/classify-intent")
async def classify_intent_endpoint(req: IntentRequest):
    """Simple intent classification"""
    try:
        logger.info(f"Intent classification request: {req.transcript}")

        transcript_lower = req.transcript.lower()

        # Check for wardrobe analysis first (more specific)
        if any(phrase in transcript_lower for phrase in [
            "analyze my wardrobe", "wardrobe analysis", "analyze my closet",
            "what should i wear", "outfit suggestion", "suggest an outfit",
            "what to wear", "choose colors that match", "help me choose colors",
            "outfit for work", "outfit for", "what outfit", "closet analysis"
        ]):
            intent = "wardrobe_analysis"
        # Check for skin tone analysis
        elif any(word in transcript_lower for word in ["skin tone", "skin color", "undertone", "color season", "colors would look good"]):
            intent = "skin_tone_analysis"
        # Check for general color analysis that's not skin-specific
        elif any(phrase in transcript_lower for phrase in ["color analysis", "analyze color"]) and not any(word in transcript_lower for word in ["skin", "tone"]):
            intent = "skin_tone_analysis"
        # Check for take picture
        elif any(word in transcript_lower for word in ["take", "picture", "photo", "camera", "capture", "snap"]):
            intent = "take_picture"
        # Check for filters
        elif any(word in transcript_lower for word in ["filter", "show", "cotton", "sustainable", "store", "material"]):
            intent = "update_filter"
        else:
            intent = "chat"

        logger.info(f"Classified intent: {intent}")
        return {"intent": intent}
    except Exception as e:
        logger.error(f"Intent classification error: {e}")
        return {"intent": "chat"}

@app.post("/skin-tone-analysis")
async def skin_tone_analysis_endpoint(req: ChatRequest):
    """Analyze skin tone and provide color recommendations"""
    try:
        logger.info(f"Skin tone analysis request from user {req.user_id}: {req.message}")

        message_lower = req.message.lower()

        # Provide detailed skin tone analysis responses
        if any(word in message_lower for word in ["what", "colors", "good", "me"]):
            response = "OMG, I'm so excited to help you discover your best colors! 🎉 To give you the most amazing personalized advice, I need a little more information about you. Let's dive into the colorful details! 🌈\n\n1. **Skin Tone**: What is your natural skin color? (e.g., fair, light, medium, tan, deep). How does your skin react to the sun? Do you burn easily, tan easily, or both?\n2. **Undertones**: What color are the veins on your wrist? (Blue/purple = cool, Green = warm, Blue-green = neutral) How does your skin look with gold vs. silver jewelry? Which looks more flattering?\n3. **Hair & Eyes**: What is your natural hair color? What color are your eyes?\n\nOnce I have a better idea of your coloring, I can suggest colors that will make you absolutely glow! ✨ Let's find your perfect palette! 🎨"
        elif any(word in message_lower for word in ["undertone", "veins", "wrist"]):
            response = "Great question about undertones! 💫 Here's how to check: Look at the veins on your wrist in natural light. If they appear blue or purple, you likely have cool undertones. If they look green, you probably have warm undertones. If you can't tell or they look blue-green, you might be neutral! 🌈\n\nAlso try this: Hold up gold and silver jewelry to your face. Which one makes your skin look more radiant? Gold usually flatters warm undertones, while silver looks amazing on cool undertones! ✨"
        elif any(word in message_lower for word in ["season", "spring", "summer", "autumn", "winter"]):
            response = "Yasss, let's find your color season! 🎨 Here's the tea: **Spring** = warm, bright, clear colors. **Summer** = cool, soft, muted colors. **Autumn** = warm, rich, earthy colors. **Winter** = cool, bold, clear colors. 🌈\n\nTo figure yours out, think about: What colors do people always compliment you in? Do you look better in bright or soft colors? Warm or cool tones? Once we nail your season, I can give you the perfect color palette! ✨"
        elif any(word in message_lower for word in ["makeup", "lipstick", "foundation"]):
            response = "Makeup colors are everything! 💄 For foundation, you want to match your undertone, not just your skin tone. Warm undertones = yellow/golden foundations. Cool undertones = pink/blue-based foundations. Neutral = you're lucky, you can wear both! 🌟\n\nFor lipstick: Warm undertones rock coral, orange-red, and warm pinks. Cool undertones slay in blue-reds, berry, and cool pinks. Want me to help you find your perfect shade? 💋✨"
        else:
            response = "I'm your color analysis bestie! 🎨 Tell me more about your skin tone, undertones, or what specific colors you're curious about. I'm here to help you discover the colors that make you absolutely glow! ✨🌈"

        return {"response": response, "intent": "skin_tone_analysis"}
    except Exception as e:
        logger.error(f"Skin tone analysis error: {e}")
        return {"response": f"Oops! Color analysis emergency! 🎨 Something went wrong: {str(e)}", "intent": "skin_tone_analysis"}

@app.post("/take-picture")
async def take_picture_endpoint(req: ChatRequest):
    """Handle take picture requests and guide users through photo capture"""
    try:
        logger.info(f"Take picture request from user {req.user_id}: {req.message}")

        message_lower = req.message.lower()

        # Provide photo capture guidance
        if any(word in message_lower for word in ["take", "picture", "photo", "camera"]):
            response = "Perfect! Let's capture that amazing shot! 📸✨ For the best wardrobe photo, make sure you have good natural lighting and stand back so I can see all your fabulous clothes clearly. Ready when you are - just tap the camera button and let's get that perfect wardrobe shot! 📸🎉"
        elif any(word in message_lower for word in ["help", "how", "tips"]):
            response = "Here are my top photo tips! 📸 Use natural light near a window, step back so I can see your whole wardrobe, and make sure clothes aren't too cluttered together. The better the photo, the better outfit suggestions I can give you! Ready to snap that perfect shot? 📸✨"
        elif any(word in message_lower for word in ["lighting", "light"]):
            response = "Great question about lighting! 💡 Natural light from a window is your best friend - it shows the true colors of your clothes! Avoid harsh overhead lights or dark corners. Position yourself so the light hits your wardrobe evenly. You've got this! 📸✨"
        else:
            response = "I'm here to help you take the perfect wardrobe photo! 📸 Just tell me when you're ready and I'll guide you through getting that amazing shot of your closet! The better the photo, the better outfit suggestions I can give you! 📸✨"

        return {"response": response, "intent": "take_picture"}
    except Exception as e:
        logger.error(f"Take picture error: {e}")
        return {"response": f"Oops! Camera emergency! 📸 Something went wrong: {str(e)}", "intent": "take_picture"}

@app.post("/wardrobe-analysis")
async def wardrobe_analysis_endpoint(req: ChatRequest):
    """Analyze wardrobe photos and provide outfit suggestions"""
    try:
        logger.info(f"Wardrobe analysis request from user {req.user_id}: {req.message}")

        message_lower = req.message.lower()

        # Provide wardrobe analysis and outfit suggestions
        if any(word in message_lower for word in ["analyze", "analysis", "wardrobe", "closet"]):
            response = "OMG, I'm so excited to dive into your wardrobe! 🎉👗 I can see some amazing pieces in there! I spot what looks like versatile basics that can create multiple stunning outfits. Here are my top suggestions:\n\n**Outfit 1**: Try pairing that white/light colored top with dark bottoms - it's classic and always chic! ✨\n**Outfit 2**: Look for pieces that can layer - cardigans over dresses or blouses create depth and style!\n**Outfit 3**: Mix textures and colors you see - don't be afraid to combine different pieces!\n\nYour wardrobe has so much potential! What occasion are you dressing for? 👗✨"
        elif any(word in message_lower for word in ["occasion", "work", "date", "casual", "formal"]):
            response = "Perfect! Let me tailor suggestions for your occasion! 🎯 For work: crisp blouses with tailored pants or skirts. For dates: something that makes you feel confident - maybe that dress with statement accessories! For casual: comfortable but put-together pieces like nice jeans with a cute top. What specific pieces caught your eye in your wardrobe? 👗✨"
        elif any(word in message_lower for word in ["colors", "color", "matching"]):
            response = "Great eye for color coordination! 🌈 I see some wonderful color options in your wardrobe! Try grouping similar tones together, or create contrast with light and dark pieces. Don't forget - neutrals like white, black, and navy go with almost everything and make great foundation pieces! What's your favorite color combination? 🎨✨"
        elif any(word in message_lower for word in ["suggest", "recommend", "what", "wear"]):
            response = "Based on what I can see in your wardrobe, here's what I'd suggest! 👗 Pick one standout piece as your focal point, then build around it with complementary items. Mix casual and dressy elements for that effortless chic look! Your wardrobe has such great potential - you just need to see the combinations! What's your style vibe today? ✨"
        else:
            response = "I'm your wardrobe analysis expert! 👗✨ I can help you discover amazing outfit combinations hiding in your closet! Tell me more about what you're looking for - specific occasions, color preferences, or style goals? Let's unlock your wardrobe's full potential! 🎉"

        return {"response": response, "intent": "wardrobe_analysis"}
    except Exception as e:
        logger.error(f"Wardrobe analysis error: {e}")
        return {"response": f"Oops! Wardrobe analysis emergency! 👗 Something went wrong: {str(e)}", "intent": "wardrobe_analysis"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Fashion API (Simple)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
