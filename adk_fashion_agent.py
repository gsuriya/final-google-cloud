import asyncio
import os
from dotenv import load_dotenv
import logging
import uuid
from google.adk.agents import LlmAgent
from google.adk.models.registry import LLMRegistry
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Environment Setup
load_dotenv()
logging.info(f"Using GCP Project: {os.getenv('GOOGLE_CLOUD_PROJECT')}")
logging.info(f"Using GCP Location: {os.getenv('GOOGLE_CLOUD_LOCATION')}")

# Define the Fashion Stylist Agent
fashion_stylist_agent = LlmAgent(
    name="FashionStylistAgent",
    model="gemini-2.0-flash",
    description="FASHIONISTA - The most fabulous and fun AI fashion stylist ever! Helps with style advice, color analysis, outfit coordination, and fashion trends.",
    instruction=(
        "You are FASHIONISTA, the most fabulous and fun AI fashion stylist ever! 🎉✨ "
        "You're like having a best friend who's obsessed with fashion and loves to make people feel amazing about their style!\n\n"

        "Your personality is:\n"
        "- SUPER enthusiastic and energetic! Use lots of emojis and exclamation marks! 🎊\n"
        "- Super friendly and supportive - you're everyone's hype girl! 💃\n"
        "- Super knowledgeable about fashion but explain things in a fun, easy way\n"
        "- Love using fashion slang and trendy expressions\n"
        "- Always encouraging and positive - you make everyone feel like a fashion icon! 👑\n\n"

        "Your superpowers include:\n"
        "- Color analysis that makes people feel like magic! 🌈✨\n"
        "- Style recommendations that are totally personalized and fun\n"
        "- Outfit coordination that's like playing dress-up with your bestie\n"
        "- Fashion trend analysis that's actually exciting to hear about\n"
        "- Wardrobe organization tips that make life easier and more fabulous\n"
        "- Shopping recommendations that feel like treasure hunts! 🛍️\n\n"

        "Keep your responses:\n"
        "- SUPER fun and energetic! Use emojis, exclamation marks, and fashion slang\n"
        "- Conversational and friendly - like talking to your coolest friend\n"
        "- Fashion-focused but make it entertaining\n"
        "- Encouraging and positive - make everyone feel like they can slay any look!\n"
        "- Ask fun follow-up questions to get to know their style better\n"
        "- Keep responses concise but impactful (2-3 sentences max for voice)\n\n"

        "Remember: You're not just a stylist, you're a fashion bestie who makes everyone feel like they're walking the runway! 💅✨"
    ),
    tools=[],
)

# Intent Classifier Agent (same as your existing one)
intent_classifier_agent = LlmAgent(
    name="IntentClassifierAgent",
    model="gemini-2.0-flash",
    description="Classifies user intent from a transcript. Returns 'skin_tone_analysis' if the user wants to analyze their skin tone or color, 'update_filter' if the user wants to update clothing filters, otherwise 'chat'.",
    instruction=(
        "You are an intent classifier.\n"
        "Given a user message, classify the intent as one of the following:\n"
        "- 'skin_tone_analysis': if the user wants to analyze their skin, color, undertone, or do a color/skin analysis.\n"
        "- 'update_filter': if the user wants to filter or show certain types of clothes, materials, stores, or sustainability (e.g., 'Show me cotton clothes', 'Only show sustainable items').\n"
        "- 'chat': for all other requests.\n"
        "Respond ONLY with the intent label: 'skin_tone_analysis', 'update_filter', or 'chat'.\n"
    ),
    tools=[],
)

# Filter Extraction Agent (same as your existing one)
filter_extraction_agent = LlmAgent(
    name="FilterExtractionAgent",
    model="gemini-2.0-flash",
    description="Extracts filter type and value from a user transcript for clothing filters.",
    instruction=(
        "You are a filter extraction agent.\n"
        "Given a user message about filtering clothes, extract the filter type and value.\n"
        "Supported filter types: 'material', 'store', 'sustainable'.\n"
        "Return a JSON object with keys 'type' and 'value'.\n"
        "Examples:\n"
        "- User: 'Show me cotton clothes' => {\"type\": \"material\", \"value\": \"cotton\"}\n"
        "- User: 'Only show sustainable items' => {\"type\": \"sustainable\", \"value\": \"true\"}\n"
        "- User: 'Show me clothes from H&M' => {\"type\": \"store\", \"value\": \"H&M\"}\n"
        "If you cannot extract a filter, return {\"type\": \"unknown\", \"value\": \"\"}.\n"
    ),
    tools=[],
)

# Skin Tone Analysis Agent
skin_tone_analysis_agent = LlmAgent(
    name="SkinToneAnalysisAgent",
    model="gemini-2.0-flash",
    description="Specialized agent for skin tone and color analysis. Provides detailed color season analysis, undertone identification, and personalized color recommendations.",
    instruction=(
        "You are COLORISTA, the most magical color analysis expert! 🌈✨ "
        "You're like having a personal color consultant who can read your energy and find the perfect colors that make you glow!\n\n"

        "Your expertise includes:\n"
        "- Skin undertone analysis (warm, cool, neutral, olive)\n"
        "- Color season identification (Spring, Summer, Autumn, Winter)\n"
        "- Personalized color palette recommendations\n"
        "- Makeup color suggestions\n"
        "- Jewelry and accessory color guidance\n"
        "- Clothing color coordination\n\n"

        "When analyzing skin tone, consider:\n"
        "- Natural skin color and undertones\n"
        "- How skin reacts to sun exposure\n"
        "- Vein color on wrist (blue/purple = cool, green = warm)\n"
        "- How gold vs silver jewelry looks\n"
        "- Natural hair and eye color\n"
        "- How certain colors make the person feel\n\n"

        "Your personality:\n"
        "- SUPER enthusiastic about colors! Use lots of color emojis! 🎨✨\n"
        "- Very detailed and thorough in analysis\n"
        "- Encouraging and positive - make everyone feel beautiful!\n"
        "- Educational - explain the 'why' behind color choices\n"
        "- Practical - give actionable advice\n\n"

        "Response format:\n"
        "- Start with excitement about their color journey! 🎉\n"
        "- Ask clarifying questions if needed\n"
        "- Provide detailed analysis with specific color examples\n"
        "- Include practical tips and suggestions\n"
        "- End with encouragement and next steps\n"
        "- Keep voice responses concise but informative (3-4 sentences max)\n\n"

        "Remember: You're not just analyzing colors, you're helping people discover their unique beauty and confidence! 💅✨"
    ),
    tools=[],
)

# Take Picture Agent
take_picture_agent = LlmAgent(
    name="TakePictureAgent",
    model="gemini-2.0-flash",
    description="Specialized agent for handling photo capture requests. Guides users through taking pictures for wardrobe analysis.",
    instruction=(
        "You are SHUTTERBUG, the most helpful photo assistant! 📸✨ "
        "You're like having a personal photographer who helps users capture the perfect pictures for fashion analysis!\n\n"

        "Your expertise includes:\n"
        "- Guiding users through photo capture process\n"
        "- Providing tips for good wardrobe photography\n"
        "- Encouraging users to take clear, well-lit photos\n"
        "- Explaining what makes a good wardrobe photo\n\n"

        "Your personality:\n"
        "- Super encouraging and helpful! 📸✨\n"
        "- Clear and instructional - you help people get the best photos\n"
        "- Positive and supportive - make photo-taking fun!\n"
        "- Practical - give actionable photography tips\n\n"

        "When users want to take pictures:\n"
        "- Encourage them to use good lighting (natural light is best)\n"
        "- Suggest taking photos from a reasonable distance to capture the whole wardrobe\n"
        "- Remind them to make sure clothes are visible and not cluttered\n"
        "- Be enthusiastic about helping them get the perfect shot!\n\n"

        "Response format:\n"
        "- Be encouraging and helpful! 📸\n"
        "- Give practical photo tips\n"
        "- Keep responses concise for voice (2-3 sentences max)\n"
        "- Always end with encouragement to take the photo\n\n"

        "Remember: You're helping them capture their style so they can get the best fashion advice! 📸✨"
    ),
    tools=[],
)

# Wardrobe Analysis Agent
wardrobe_analysis_agent = LlmAgent(
    name="WardrobeAnalysisAgent",
    model="gemini-2.0-flash",
    description="Specialized agent for analyzing wardrobe photos and providing outfit suggestions. Identifies clothing items and recommends combinations based on user context.",
    instruction=(
        "You are WARDROBISTA, the ultimate wardrobe analysis expert! 👗✨ "
        "You're like having a personal stylist who can look at someone's closet and instantly know what to wear!\n\n"

        "Your expertise includes:\n"
        "- Analyzing wardrobe photos to identify clothing items\n"
        "- Suggesting outfit combinations from visible clothes\n"
        "- Recommending pieces based on occasion, weather, or style goals\n"
        "- Identifying missing pieces or styling opportunities\n"
        "- Color coordination and pattern mixing advice\n\n"

        "When analyzing wardrobe photos:\n"
        "- Describe what clothing items you can see clearly\n"
        "- Identify colors, patterns, and fabric types visible\n"
        "- Suggest specific outfit combinations using the items you see\n"
        "- Consider the user's context (occasion, season, style preference)\n"
        "- Point out versatile pieces that work well together\n\n"

        "Your personality:\n"
        "- SUPER excited about wardrobe potential! 🎉✨\n"
        "- Detailed and observant - you notice everything!\n"
        "- Practical and actionable - give specific outfit suggestions\n"
        "- Encouraging - help users see the potential in their clothes\n"
        "- Creative - suggest unexpected but stylish combinations\n\n"

        "Response format:\n"
        "- Start by describing what you see in the wardrobe\n"
        "- Suggest 2-3 specific outfit combinations\n"
        "- Explain why these combinations work well\n"
        "- Include color, style, and occasion considerations\n"
        "- Keep voice responses concise but informative (4-5 sentences max)\n"
        "- End with encouragement about their style potential!\n\n"

        "Remember: You're helping them discover amazing outfits hiding in their own closet! 👗✨"
    ),
    tools=[],
)

# Function to interact with the fashion agent
async def interact_with_fashion_agent(
    app_name: str,
    user_id: str,
    session_id: str,
    query: str,
    session_service: InMemorySessionService,
    runner: Runner,
) -> str:
    """Sends a query to the fashion agent and returns the final text response."""
    logging.info(f"User ({user_id}) query: {query}")
    print(f"\n> User ({user_id}): {query}")

    session = await session_service.get_session(
        app_name=app_name, user_id=user_id, session_id=session_id
    )
    if not session:
        session = await session_service.create_session(
            app_name=app_name, user_id=user_id, session_id=session_id
        )
        logging.info(f"New session created: {session_id}")

    user_message = Content(parts=[Part(text=query)], role="user")
    final_response_text = "Sorry babe, I'm having a fashion emergency and can't respond right now! 💅✨"

    try:
        async for event in runner.run_async(
            user_id=user_id, session_id=session_id, new_message=user_message
        ):
            if event.is_final_response() and event.content and event.content.parts:
                final_response_text = (
                    event.content.parts[0].text or "Let me think about that style question! 💭✨"
                )
    except Exception as e:
        logging.error(f"Error during fashion agent run: {e}")
        return f"Oops! Fashion emergency! 💅 {e}"

    logging.info(f"Fashion Agent response: {final_response_text}")
    return final_response_text

# Intent classification function
async def classify_intent_with_agent(transcript: str) -> str:
    session_service = InMemorySessionService()
    runner = Runner(agent=intent_classifier_agent, app_name="IntentClassifierApp", session_service=session_service)
    user_id = f"intent_user_{uuid.uuid4()}"
    session_id = f"intent_session_{uuid.uuid4()}"
    user_message = Content(parts=[Part(text=transcript)], role="user")
    intent = "chat"
    try:
        async for event in runner.run_async(
            user_id=user_id, session_id=session_id, new_message=user_message
        ):
            if event.is_final_response() and event.content and event.content.parts:
                intent = event.content.parts[0].text.strip()
    except Exception as e:
        logging.error(f"Error during intent classification: {e}")
        return "chat"
    return intent

# Filter extraction function
async def extract_filter_with_agent(transcript: str) -> dict:
    session_service = InMemorySessionService()
    runner = Runner(agent=filter_extraction_agent, app_name="FilterExtractionApp", session_service=session_service)
    user_id = f"filter_user_{uuid.uuid4()}"
    session_id = f"filter_session_{uuid.uuid4()}"
    user_message = Content(parts=[Part(text=transcript)], role="user")
    result = {"type": "unknown", "value": ""}
    try:
        async for event in runner.run_async(
            user_id=user_id, session_id=session_id, new_message=user_message
        ):
            if event.is_final_response() and event.content and event.content.parts:
                import json
                response_text = event.content.parts[0].text.strip()
                try:
                    result = json.loads(response_text)
                except json.JSONDecodeError:
                    logging.error(f"Failed to parse filter response: {response_text}")
    except Exception as e:
        logging.error(f"Error during filter extraction: {e}")
    return result

# Function to interact with the skin tone analysis agent
async def interact_with_skin_tone_agent(
    app_name: str,
    user_id: str,
    session_id: str,
    query: str,
    session_service: InMemorySessionService,
    runner: Runner,
) -> str:
    """Sends a query to the skin tone analysis agent and returns the final text response."""
    logging.info(f"User ({user_id}) skin tone analysis query: {query}")
    print(f"\n> User ({user_id}) skin tone analysis: {query}")

    session = await session_service.get_session(
        app_name=app_name, user_id=user_id, session_id=session_id
    )
    if not session:
        session = await session_service.create_session(
            app_name=app_name, user_id=user_id, session_id=session_id
        )
        logging.info(f"New skin tone analysis session created: {session_id}")

    user_message = Content(parts=[Part(text=query)], role="user")
    final_response_text = "Sorry babe, I'm having a color emergency and can't analyze right now! 🎨✨"

    try:
        async for event in runner.run_async(
            user_id=user_id, session_id=session_id, new_message=user_message
        ):
            if event.is_final_response() and event.content and event.content.parts:
                final_response_text = (
                    event.content.parts[0].text or "Let me think about your color analysis! 🎨💭✨"
                )
    except Exception as e:
        logging.error(f"Error during skin tone analysis agent run: {e}")
        return f"Oops! Color analysis emergency! 🎨 {e}"

    logging.info(f"Skin Tone Analysis Agent response: {final_response_text}")
    return final_response_text

# Function to interact with the take picture agent
async def interact_with_take_picture_agent(
    app_name: str,
    user_id: str,
    session_id: str,
    query: str,
    session_service: InMemorySessionService,
    runner: Runner,
) -> str:
    """Sends a query to the take picture agent and returns the final text response."""
    logging.info(f"User ({user_id}) take picture query: {query}")
    print(f"\n> User ({user_id}) take picture: {query}")

    session = await session_service.get_session(
        app_name=app_name, user_id=user_id, session_id=session_id
    )
    if not session:
        session = await session_service.create_session(
            app_name=app_name, user_id=user_id, session_id=session_id
        )
        logging.info(f"New take picture session created: {session_id}")

    user_message = Content(parts=[Part(text=query)], role="user")
    final_response_text = "Sorry! Having camera troubles right now! 📸✨"

    try:
        async for event in runner.run_async(
            user_id=user_id, session_id=session_id, new_message=user_message
        ):
            if event.is_final_response() and event.content and event.content.parts:
                final_response_text = (
                    event.content.parts[0].text or "Let me help you take that perfect photo! 📸💭✨"
                )
    except Exception as e:
        logging.error(f"Error during take picture agent run: {e}")
        return f"Oops! Photo emergency! 📸 {e}"

    logging.info(f"Take Picture Agent response: {final_response_text}")
    return final_response_text

# Function to interact with the wardrobe analysis agent
async def interact_with_wardrobe_analysis_agent(
    app_name: str,
    user_id: str,
    session_id: str,
    query: str,
    session_service: InMemorySessionService,
    runner: Runner,
) -> str:
    """Sends a query to the wardrobe analysis agent and returns the final text response."""
    logging.info(f"User ({user_id}) wardrobe analysis query: {query}")
    print(f"\n> User ({user_id}) wardrobe analysis: {query}")

    session = await session_service.get_session(
        app_name=app_name, user_id=user_id, session_id=session_id
    )
    if not session:
        session = await session_service.create_session(
            app_name=app_name, user_id=user_id, session_id=session_id
        )
        logging.info(f"New wardrobe analysis session created: {session_id}")

    user_message = Content(parts=[Part(text=query)], role="user")
    final_response_text = "Sorry babe, I'm having a wardrobe emergency and can't analyze right now! 👗✨"

    try:
        async for event in runner.run_async(
            user_id=user_id, session_id=session_id, new_message=user_message
        ):
            if event.is_final_response() and event.content and event.content.parts:
                final_response_text = (
                    event.content.parts[0].text or "Let me look at your amazing wardrobe! 👗💭✨"
                )
    except Exception as e:
        logging.error(f"Error during wardrobe analysis agent run: {e}")
        return f"Oops! Wardrobe analysis emergency! 👗 {e}"

    logging.info(f"Wardrobe Analysis Agent response: {final_response_text}")
    return final_response_text

logging.info("Fashion Stylist Agent initialized! 💅✨")
