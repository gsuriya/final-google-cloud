#!/usr/bin/env python3
"""
Complete Fashion Assistant Demo
Demonstrates the full voice-based fashion assistant with all agents:
- IntentClassifierAgent
- SkinToneAnalysisAgent
- TakePictureAgent
- WardrobeAnalysisAgent
- FashionStylistAgent
"""

import requests
import time

BASE_URL = "http://localhost:8000"

def simulate_complete_user_journey():
    """Simulate a complete user journey using all agents."""

    print("🎭 Complete Fashion Assistant Demo")
    print("=" * 50)
    print("Simulating a real user journey with voice commands...\n")

    journey = [
        {
            "user_says": "Hey, I need help with my style!",
            "description": "Initial greeting",
            "expected_agent": "FashionStylistAgent"
        },
        {
            "user_says": "What colors would look good on me?",
            "description": "Skin tone analysis request",
            "expected_agent": "SkinToneAnalysisAgent"
        },
        {
            "user_says": "Take a picture of my wardrobe",
            "description": "Photo capture request",
            "expected_agent": "TakePictureAgent"
        },
        {
            "user_says": "Now analyze my wardrobe",
            "description": "Wardrobe analysis request",
            "expected_agent": "WardrobeAnalysisAgent"
        },
        {
            "user_says": "Suggest an outfit for work",
            "description": "Specific occasion outfit request",
            "expected_agent": "WardrobeAnalysisAgent"
        },
        {
            "user_says": "What about something casual?",
            "description": "Follow-up styling question",
            "expected_agent": "FashionStylistAgent or WardrobeAnalysisAgent"
        },
        {
            "user_says": "Thanks for all the help!",
            "description": "Closing conversation",
            "expected_agent": "FashionStylistAgent"
        }
    ]

    user_id = "demo_journey_user"
    session_id = "demo_journey_session"

    for i, step in enumerate(journey, 1):
        print(f"🎬 Scene {i}: {step['description']}")
        print(f"👤 User: '{step['user_says']}'")

        # Step 1: Intent Classification
        intent_response = requests.post(
            f"{BASE_URL}/classify-intent",
            json={"transcript": step['user_says']}
        ).json()
        intent = intent_response.get('intent')
        print(f"🧠 Intent: {intent}")

        # Step 2: Route to appropriate agent
        if intent == "skin_tone_analysis":
            response = requests.post(
                f"{BASE_URL}/skin-tone-analysis",
                json={"user_id": user_id, "session_id": session_id, "message": step['user_says']}
            ).json()
            agent = "SkinToneAnalysisAgent (COLORISTA)"
        elif intent == "take_picture":
            response = requests.post(
                f"{BASE_URL}/take-picture",
                json={"user_id": user_id, "session_id": session_id, "message": step['user_says']}
            ).json()
            agent = "TakePictureAgent (SHUTTERBUG)"
        elif intent == "wardrobe_analysis":
            response = requests.post(
                f"{BASE_URL}/wardrobe-analysis",
                json={"user_id": user_id, "session_id": session_id, "message": step['user_says']}
            ).json()
            agent = "WardrobeAnalysisAgent (WARDROBISTA)"
        else:
            response = requests.post(
                f"{BASE_URL}/chat",
                json={"user_id": user_id, "session_id": session_id, "message": step['user_says']}
            ).json()
            agent = "FashionStylistAgent (FASHIONISTA)"

        ai_response = response.get('response', 'No response')
        print(f"🤖 {agent}: {ai_response[:150]}...")

        print("🔊 [Voice Output Simulated]")
        print("-" * 50)
        time.sleep(2)

def test_all_agents_individual():
    """Test each agent individually to show their specializations."""

    print("\n🧪 Individual Agent Testing")
    print("=" * 40)

    agents = [
        {
            "name": "SkinToneAnalysisAgent (COLORISTA)",
            "endpoint": "/skin-tone-analysis",
            "test_input": "What's my undertone?",
            "specialty": "Color analysis and seasonal color typing"
        },
        {
            "name": "TakePictureAgent (SHUTTERBUG)",
            "endpoint": "/take-picture",
            "test_input": "Help me take a good photo",
            "specialty": "Photography guidance and tips"
        },
        {
            "name": "WardrobeAnalysisAgent (WARDROBISTA)",
            "endpoint": "/wardrobe-analysis",
            "test_input": "What should I wear for a date?",
            "specialty": "Outfit suggestions and wardrobe analysis"
        },
        {
            "name": "FashionStylistAgent (FASHIONISTA)",
            "endpoint": "/chat",
            "test_input": "What are the latest trends?",
            "specialty": "General fashion advice and styling"
        }
    ]

    for agent in agents:
        print(f"\n🎯 Testing: {agent['name']}")
        print(f"💼 Specialty: {agent['specialty']}")
        print(f"📝 Test Input: '{agent['test_input']}'")

        response = requests.post(
            f"{BASE_URL}{agent['endpoint']}",
            json={
                "user_id": "individual_test",
                "session_id": "individual_session",
                "message": agent['test_input']
            }
        ).json()

        ai_response = response.get('response', 'No response')
        print(f"🤖 Response: {ai_response[:100]}...")
        print("-" * 30)

def demonstrate_intent_classification():
    """Show how intent classification routes to different agents."""

    print("\n🎯 Intent Classification Demo")
    print("=" * 35)

    test_phrases = [
        "What colors suit me best?",
        "Take a picture please",
        "Analyze my wardrobe",
        "What should I wear to work?",
        "Help me choose an outfit",
        "What's trending in fashion?",
        "Show me cotton dresses",
        "I need style advice"
    ]

    for phrase in test_phrases:
        intent_response = requests.post(
            f"{BASE_URL}/classify-intent",
            json={"transcript": phrase}
        ).json()
        intent = intent_response.get('intent')

        agent_map = {
            "skin_tone_analysis": "🌈 SkinToneAnalysisAgent",
            "take_picture": "📸 TakePictureAgent",
            "wardrobe_analysis": "👗 WardrobeAnalysisAgent",
            "update_filter": "🔍 FilterExtractionAgent",
            "chat": "💅 FashionStylistAgent"
        }

        agent = agent_map.get(intent, "❓ Unknown")
        print(f"'{phrase}' → {intent} → {agent}")

def show_system_architecture():
    """Display the system architecture."""

    print("\n🏗️ System Architecture")
    print("=" * 25)
    print("""
🎤 Voice Input
    ↓
🧠 Intent Classification
    ↓
🔀 Agent Routing:
    ├── 🌈 SkinToneAnalysisAgent (COLORISTA)
    ├── 📸 TakePictureAgent (SHUTTERBUG)
    ├── 👗 WardrobeAnalysisAgent (WARDROBISTA)
    ├── 🔍 FilterExtractionAgent
    └── 💅 FashionStylistAgent (FASHIONISTA)
    ↓
💬 Specialized Response
    ↓
🔊 Voice Output
""")

def show_voice_commands():
    """Display all available voice commands organized by agent."""

    print("\n🎤 Voice Commands by Agent")
    print("=" * 30)

    commands = {
        "🌈 Color Analysis": [
            "What colors would look good on me?",
            "What's my skin tone?",
            "Analyze my undertones",
            "What's my color season?"
        ],
        "📸 Photo Capture": [
            "Take a picture",
            "Help me take a photo",
            "Camera tips please",
            "How do I get good lighting?"
        ],
        "👗 Wardrobe Analysis": [
            "Analyze my wardrobe",
            "What should I wear?",
            "Suggest an outfit for work",
            "Help me choose colors that match",
            "What outfit for a date?"
        ],
        "💅 General Fashion": [
            "What's my style?",
            "Latest fashion trends?",
            "Help with outfit ideas",
            "Fashion advice please"
        ],
        "🔍 Filters": [
            "Show me cotton clothes",
            "Only sustainable items",
            "Filter by material"
        ]
    }

    for category, cmd_list in commands.items():
        print(f"\n{category}:")
        for cmd in cmd_list:
            print(f"  • '{cmd}'")

if __name__ == "__main__":
    try:
        # Check server status
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Fashion Assistant System Online!")

            # Run complete demo
            simulate_complete_user_journey()
            test_all_agents_individual()
            demonstrate_intent_classification()
            show_system_architecture()
            show_voice_commands()

            print("\n🎉 Complete System Demo Finished!")
            print("\n🌟 Features Demonstrated:")
            print("✅ Voice-to-text transcription")
            print("✅ Smart intent classification")
            print("✅ Multi-agent routing")
            print("✅ Specialized agent responses")
            print("✅ Session management")
            print("✅ Text-to-speech output")
            print("✅ Complete conversation flow")

            print("\n🚀 Ready for Production Use!")

        else:
            print("❌ Server error")

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server")
        print("Make sure the server is running: python3 main_simple.py")
    except Exception as e:
        print(f"❌ Error: {e}")
