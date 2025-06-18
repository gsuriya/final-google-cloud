from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import logging
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
from PIL import Image
import json
from typing import Optional

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

class ImageAnalysisRequest(BaseModel):
    user_id: str
    session_id: str
    message: str
    image_data: str  # base64 encoded image

class IntentRequest(BaseModel):
    transcript: str

def analyze_image_colors(image_base64: str) -> dict:
    """Simple color analysis from base64 image"""
    try:
        # Remove data:image/jpeg;base64, prefix if present
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data)).convert('RGB')

        # Resize for processing
        image = image.resize((100, 100))

        # Get dominant colors
        pixels = list(image.getdata())

        # Simple color analysis - get average RGB
        r_total = sum(p[0] for p in pixels)
        g_total = sum(p[1] for p in pixels)
        b_total = sum(p[2] for p in pixels)

        avg_r = r_total // len(pixels)
        avg_g = g_total // len(pixels)
        avg_b = b_total // len(pixels)

        # Determine skin tone characteristics
        if avg_r > avg_g and avg_r > avg_b:
            dominant_tone = "warm"
        elif avg_b > avg_r and avg_b > avg_g:
            dominant_tone = "cool"
        else:
            dominant_tone = "neutral"

        return {
            "avg_rgb": [avg_r, avg_g, avg_b],
            "dominant_tone": dominant_tone,
            "analysis_available": True
        }
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        return {
            "avg_rgb": [0, 0, 0],
            "dominant_tone": "neutral",
            "analysis_available": False,
            "error": str(e)
        }

def analyze_wardrobe_image(image_base64: str) -> dict:
    """Simple wardrobe analysis from base64 image"""
    try:
        # Remove data:image/jpeg;base64, prefix if present
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data)).convert('RGB')

        # Get image dimensions and colors for analysis
        width, height = image.size

        # Resize for color analysis
        image_small = image.resize((50, 50))
        pixels = list(image_small.getdata())

        # Analyze color variety (simple approach)
        unique_colors = len(set(pixels))
        color_variety = "high" if unique_colors > 1000 else "medium" if unique_colors > 500 else "low"

        # Simple brightness analysis
        brightness_total = sum(sum(p) for p in pixels)
        avg_brightness = brightness_total / (len(pixels) * 3)
        brightness_level = "bright" if avg_brightness > 170 else "medium" if avg_brightness > 85 else "dark"

        return {
            "image_dimensions": [width, height],
            "color_variety": color_variety,
            "brightness_level": brightness_level,
            "total_pixels": len(pixels),
            "analysis_available": True
        }
    except Exception as e:
        logger.error(f"Wardrobe image analysis error: {e}")
        return {
            "analysis_available": False,
            "error": str(e)
        }

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

        # First, suggest taking a photo for better analysis
        response = "Hey gorgeous! 🌈✨ I'd love to analyze your skin tone! For the most accurate color analysis, I need to see a photo of you. Please take a selfie with good natural lighting so I can see your beautiful features clearly! 📸\n\nOnce you take the photo, I'll be able to give you personalized recommendations for:\n• Your undertone (warm, cool, or neutral)\n• Your perfect color season\n• Best makeup colors for you\n• Colors that make you glow! ✨\n\nJust say 'take a picture' and then come back to me for analysis! 💅🎨"

        return {"response": response, "intent": "skin_tone_analysis", "requires_photo": True}
    except Exception as e:
        logger.error(f"Skin tone analysis error: {e}")
        return {"response": f"Oops! Color analysis emergency! 🎨 Something went wrong: {str(e)}", "intent": "skin_tone_analysis"}

@app.post("/skin-tone-analysis-with-image")
async def skin_tone_analysis_with_image_endpoint(req: ImageAnalysisRequest):
    """Analyze skin tone from uploaded image"""
    try:
        logger.info(f"Skin tone analysis with image from user {req.user_id}")

        # Analyze the uploaded image
        color_analysis = analyze_image_colors(req.image_data)

        if not color_analysis["analysis_available"]:
            return {"response": "Oops! I had trouble analyzing your photo 🤔 Let's try taking another one with better lighting! The clearer the photo, the better I can help you discover your perfect colors! ✨", "intent": "skin_tone_analysis"}

        # Generate personalized response based on analysis
        dominant_tone = color_analysis["dominant_tone"]
        avg_rgb = color_analysis["avg_rgb"]

        if dominant_tone == "warm":
            response = f"OMG, I can see your beautiful warm undertones! 🌅✨ Based on your photo analysis, you have gorgeous warm coloring that would look absolutely stunning in:\n\n🎨 **Your Best Colors:**\n• Rich corals and warm pinks\n• Golden yellows and warm oranges\n• Earthy browns and warm reds\n• Cream and warm whites\n• Camel and warm beiges\n\n💄 **Makeup Magic:**\n• Golden/yellow-based foundations\n• Coral, peach, and warm pink lipsticks\n• Warm brown eyeshadows with gold accents\n• Bronze and gold highlighters\n\n✨ **Style Tip:** You're likely a Spring or Autumn - try gold jewelry and warm-toned clothes to make your natural beauty shine!"
        elif dominant_tone == "cool":
            response = f"Wow, your cool undertones are absolutely gorgeous! ❄️✨ Your photo shows beautiful cool coloring that would be stunning in:\n\n🎨 **Your Best Colors:**\n• True blues and cool purples\n• Cool pinks and berry tones\n• Emerald greens and teals\n• Pure whites and cool grays\n• Navy and charcoal\n\n💄 **Makeup Magic:**\n• Pink/blue-based foundations\n• Berry, rose, and cool pink lipsticks\n• Cool-toned eyeshadows with silver accents\n• Silver and pearl highlighters\n\n✨ **Style Tip:** You're likely a Summer or Winter - try silver jewelry and cool-toned clothes to complement your natural coolness!"
        else:
            response = f"Lucky you - you have beautiful neutral undertones! 🌈✨ This means you can wear both warm AND cool colors! Based on your photo:\n\n🎨 **Your Best Colors:**\n• Both warm and cool colors work for you!\n• Classic neutrals like navy, gray, and cream\n• Soft pastels and rich jewel tones\n• Both gold and silver look great\n\n💄 **Makeup Magic:**\n• You can wear most foundation shades\n• Try both warm and cool lipstick tones\n• Experiment with different eyeshadow colors\n• Both gold and silver highlighters work\n\n✨ **Style Tip:** You have the ultimate flexibility! Try mixing warm and cool pieces for unique, personalized looks!"

        return {"response": response, "intent": "skin_tone_analysis", "analysis": color_analysis}
    except Exception as e:
        logger.error(f"Skin tone analysis with image error: {e}")
        return {"response": f"Oops! Color analysis emergency! 🎨 Something went wrong: {str(e)}", "intent": "skin_tone_analysis"}

@app.post("/take-picture")
async def take_picture_endpoint(req: ChatRequest):
    """Handle take picture requests and trigger photo capture"""
    try:
        logger.info(f"Take picture request from user {req.user_id}: {req.message}")

        message_lower = req.message.lower()

        # Provide photo capture guidance and trigger capture
        if any(word in message_lower for word in ["take", "picture", "photo", "camera", "capture", "snap"]):
            response = "Perfect! Let's capture that amazing shot! 📸✨ I can see your camera is ready! For the best photo:\n\n💡 **Lighting Tips:**\n• Use natural light near a window\n• Avoid harsh shadows or dark corners\n• Make sure your face/wardrobe is well-lit\n\n📸 **Photo Tips:**\n• Stand at a good distance so I can see everything clearly\n• Make sure the image isn't blurry\n• Try to have a clean background\n\nReady? Tap the camera button to take your photo! I'll be here to analyze it once you're done! 🎉✨"
        elif any(word in message_lower for word in ["help", "how", "tips"]):
            response = "Here are my top photo tips! 📸\n\n🌟 **For Wardrobe Photos:**\n• Stand back so I can see your whole outfit/closet\n• Good lighting shows true colors\n• Avoid cluttered backgrounds\n\n🌟 **For Selfies (skin analysis):**\n• Natural light is your best friend\n• Face the camera directly\n• Remove makeup if possible for accurate analysis\n\nJust tap the camera button when you're ready! 📸✨"
        elif any(word in message_lower for word in ["lighting", "light"]):
            response = "Great question about lighting! 💡 Natural light from a window is your best friend - it shows the true colors and details! Avoid:\n\n❌ Harsh overhead lights\n❌ Dark corners or shadows\n❌ Colorful lighting (like neon)\n\n✅ DO use:\n• Soft window light\n• Even, diffused lighting\n• Face the light source\n\nPosition yourself so the light hits you evenly. You've got this! 📸✨"
        else:
            response = "I'm SHUTTERBUG, your photo assistant! 📸✨ I'm here to help you take the perfect photo for analysis! Whether it's a selfie for skin tone analysis or a wardrobe shot for outfit suggestions, I'll guide you through it!\n\nJust tell me what kind of photo you want to take, and I'll give you the best tips! Ready when you are! 🎉"

        return {"response": response, "intent": "take_picture", "trigger_camera": True}
    except Exception as e:
        logger.error(f"Take picture error: {e}")
        return {"response": f"Oops! Camera emergency! 📸 Something went wrong: {str(e)}", "intent": "take_picture"}

@app.post("/wardrobe-analysis")
async def wardrobe_analysis_endpoint(req: ChatRequest):
    """Analyze wardrobe and provide outfit suggestions - requires photo"""
    try:
        logger.info(f"Wardrobe analysis request from user {req.user_id}: {req.message}")

        # Always request a photo first for wardrobe analysis
        response = "Hey gorgeous! 👗✨ I'm WARDROBISTA, your personal wardrobe expert! To give you the most amazing outfit suggestions, I need to see your fabulous wardrobe! \n\n📸 **Please take a photo of:**\n• Your closet or wardrobe\n• A specific outfit you're considering\n• Clothes laid out on your bed\n• Or whatever you want me to analyze!\n\n💡 **Photo Tips:**\n• Good lighting shows true colors\n• Stand back so I can see everything\n• Make sure clothes are clearly visible\n\nOnce you take the photo, I'll analyze it and give you personalized outfit suggestions! Just say 'take a picture' first! 🎉📸"

        return {"response": response, "intent": "wardrobe_analysis", "requires_photo": True}
    except Exception as e:
        logger.error(f"Wardrobe analysis error: {e}")
        return {"response": f"Oops! Wardrobe analysis emergency! 👗 Something went wrong: {str(e)}", "intent": "wardrobe_analysis"}

@app.post("/wardrobe-analysis-with-image")
async def wardrobe_analysis_with_image_endpoint(req: ImageAnalysisRequest):
    """Analyze wardrobe from uploaded image"""
    try:
        logger.info(f"Wardrobe analysis with image from user {req.user_id}")

        # Analyze the uploaded wardrobe image
        wardrobe_analysis = analyze_wardrobe_image(req.image_data)

        if not wardrobe_analysis["analysis_available"]:
            return {"response": "Oops! I had trouble seeing your wardrobe clearly 🤔 Let's try taking another photo with better lighting and make sure your clothes are clearly visible! The clearer the photo, the better outfit suggestions I can give you! ✨", "intent": "wardrobe_analysis"}

        # Generate personalized response based on image analysis
        color_variety = wardrobe_analysis["color_variety"]
        brightness_level = wardrobe_analysis["brightness_level"]

        # Create outfit suggestions based on what we can "see"
        base_response = "OMG, I'm so excited to dive into your wardrobe! 🎉👗 Based on your photo, I can see you have some amazing pieces to work with!\n\n"

        if color_variety == "high":
            color_suggestion = "🌈 **Color Variety:** I love how many different colors you have! This gives us so many options:\n• Try monochromatic looks with similar tones\n• Create contrast with light and dark pieces\n• Use neutrals as your base and add pops of color\n"
        elif color_variety == "medium":
            color_suggestion = "🎨 **Balanced Palette:** You have a nice mix of colors that work well together:\n• Focus on creating cohesive color stories\n• Mix and match pieces within the same color family\n• Add one statement piece per outfit\n"
        else:
            color_suggestion = "✨ **Classic Wardrobe:** I see you prefer a more curated, classic approach:\n• Perfect for creating timeless, elegant looks\n• Easy to mix and match everything\n• Add interesting textures or accessories for variety\n"

        if brightness_level == "bright":
            brightness_suggestion = "\n💡 **Styling Notes:** Your brighter pieces are perfect for:\n• Daytime and casual occasions\n• Spring/summer styling\n• Creating cheerful, energetic looks\n"
        elif brightness_level == "medium":
            brightness_suggestion = "\n🌟 **Styling Notes:** Your balanced tones are versatile for:\n• Both day and evening looks\n• Professional and casual settings\n• Year-round styling\n"
        else:
            brightness_suggestion = "\n🖤 **Styling Notes:** Your darker pieces are great for:\n• Evening and formal occasions\n• Fall/winter styling\n• Creating sophisticated, elegant looks\n"

        outfit_suggestions = "\n👗 **My Top Outfit Suggestions:**\n\n**Look 1 - Classic Chic:**\n• Pick your most structured piece as the base\n• Add complementary pieces in similar tones\n• Finish with accessories that tie it together\n\n**Look 2 - Casual Cool:**\n• Start with comfortable basics\n• Layer with interesting textures or patterns\n• Add one statement element (bag, shoes, or jewelry)\n\n**Look 3 - Statement Style:**\n• Choose your most unique piece as the focal point\n• Keep everything else simple and complementary\n• Let that special piece shine!\n\n✨ **Style Tip:** The key is balance - if one piece is bold, keep the rest simple. If everything is neutral, add one fun element!"

        response = base_response + color_suggestion + brightness_suggestion + outfit_suggestions

        return {"response": response, "intent": "wardrobe_analysis", "analysis": wardrobe_analysis}
    except Exception as e:
        logger.error(f"Wardrobe analysis with image error: {e}")
        return {"response": f"Oops! Wardrobe analysis emergency! 👗 Something went wrong: {str(e)}", "intent": "wardrobe_analysis"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Fashion API (Simple)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
