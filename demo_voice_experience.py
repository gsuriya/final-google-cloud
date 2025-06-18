#!/usr/bin/env python3
"""
Demo script showing the complete voice-based skin tone analysis user experience.
This simulates what a user would experience when using voice commands.
"""

import requests
import time
import json

# API base URL
BASE_URL = "http://localhost:8000"

def simulate_voice_experience():
    """Simulate the complete voice user experience."""

    print("🎤 Voice-Based Skin Tone Analysis Demo")
    print("=" * 50)
    print("This demo shows how a user would interact with the voice assistant")
    print("for skin tone analysis and color recommendations.\n")

    # Simulate user voice inputs
    voice_interactions = [
        {
            "user_says": "What colors would look good on me?",
            "description": "Initial color analysis request"
        },
        {
            "user_says": "My skin is fair and I burn easily",
            "description": "Providing skin tone information"
        },
        {
            "user_says": "My veins look blue",
            "description": "Undertone information"
        },
        {
            "user_says": "What makeup colors should I wear?",
            "description": "Makeup color inquiry"
        },
        {
            "user_says": "Thank you for the help!",
            "description": "Ending the conversation"
        }
    ]

    print("🎯 Demo Flow:")
    print("1. User speaks into microphone")
    print("2. System transcribes speech to text")
    print("3. Intent classification determines user needs")
    print("4. Request routed to appropriate agent")
    print("5. Agent provides detailed response")
    print("6. Response spoken back to user\n")

    for i, interaction in enumerate(voice_interactions, 1):
        print(f"💬 Interaction {i}: {interaction['description']}")
        print(f"👤 User says: '{interaction['user_says']}'")

        # Step 1: Intent Classification
        print("🔍 Step 1: Classifying intent...")
        intent_response = requests.post(
            f"{BASE_URL}/classify-intent",
            json={"transcript": interaction['user_says']}
        ).json()
        intent = intent_response.get('intent', 'unknown')
        print(f"   Intent: {intent}")

        # Step 2: Get response from appropriate agent
        print("🤖 Step 2: Getting agent response...")
        if intent == "skin_tone_analysis":
            response = requests.post(
                f"{BASE_URL}/skin-tone-analysis",
                json={
                    "user_id": "demo_user",
                    "session_id": "demo_session",
                    "message": interaction['user_says']
                }
            ).json()
            agent_name = "SkinToneAnalysisAgent"
        else:
            response = requests.post(
                f"{BASE_URL}/chat",
                json={
                    "user_id": "demo_user",
                    "session_id": "demo_session",
                    "message": interaction['user_says']
                }
            ).json()
            agent_name = "FashionStylistAgent"

        ai_response = response.get('response', 'No response')
        print(f"   Agent: {agent_name}")

        # Step 3: Simulate voice output
        print("🔊 Step 3: Voice output...")
        print(f"   AI says: {ai_response}")

        print("-" * 60)
        time.sleep(1)  # Simulate processing time

    print("\n🎉 Demo completed!")
    print("\n📋 Key Features Demonstrated:")
    print("✅ Voice input processing")
    print("✅ Intent classification")
    print("✅ Agent routing")
    print("✅ Specialized skin tone analysis")
    print("✅ Conversation context maintenance")
    print("✅ Natural voice responses")
    print("✅ Interactive color analysis")

def show_voice_commands():
    """Show available voice commands."""

    print("\n🎤 Available Voice Commands:")
    print("=" * 40)

    commands = [
        ("What colors would look good on me?", "skin_tone_analysis", "🌈"),
        ("Analyze my skin tone", "skin_tone_analysis", "🎨"),
        ("What's my undertone?", "skin_tone_analysis", "💫"),
        ("What's my color season?", "skin_tone_analysis", "✨"),
        ("What makeup colors should I wear?", "skin_tone_analysis", "💄"),
        ("Show me cotton clothes", "update_filter", "👗"),
        ("What's my style?", "chat", "💅"),
        ("Help me with outfit ideas", "chat", "👑")
    ]

    for command, intent, emoji in commands:
        print(f"{emoji} '{command}' → {intent}")

def show_agent_capabilities():
    """Show what each agent can do."""

    print("\n🤖 Agent Capabilities:")
    print("=" * 30)

    agents = {
        "SkinToneAnalysisAgent": [
            "Color season identification (Spring, Summer, Autumn, Winter)",
            "Undertone analysis (warm, cool, neutral, olive)",
            "Personalized color palette recommendations",
            "Makeup color suggestions",
            "Jewelry and accessory guidance",
            "Interactive analysis with follow-up questions"
        ],
        "FashionStylistAgent": [
            "General fashion advice and style recommendations",
            "Outfit coordination and trend analysis",
            "Wardrobe organization tips",
            "Shopping recommendations"
        ],
        "IntentClassifierAgent": [
            "Natural language intent recognition",
            "Multi-intent support",
            "Context-aware classification"
        ]
    }

    for agent, capabilities in agents.items():
        print(f"\n{agent}:")
        for capability in capabilities:
            print(f"  • {capability}")

if __name__ == "__main__":
    try:
        # Check if server is running
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Server is running!")

            # Run the demo
            simulate_voice_experience()

            # Show additional information
            show_voice_commands()
            show_agent_capabilities()

        else:
            print("❌ Server is not responding properly")

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server")
        print("Make sure the FastAPI server is running on localhost:8000")
        print("Run: python3 main_simple.py")
    except Exception as e:
        print(f"❌ Error: {e}")
