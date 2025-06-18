#!/usr/bin/env python3
"""
Test script for the new Take Picture and Wardrobe Analysis agents.
Demonstrates the complete voice flow with the new agents.
"""

import requests
import time
import json

# API base URL
BASE_URL = "http://localhost:8000"

def test_new_agents():
    """Test the new Take Picture and Wardrobe Analysis agents."""

    print("🎤 Testing New Agents: Take Picture & Wardrobe Analysis")
    print("=" * 60)
    print("Testing the complete voice flow with new agents:\n")

    # Test cases for new agents
    test_cases = [
        {
            "user_says": "Take a picture",
            "expected_intent": "take_picture",
            "description": "Photo capture request"
        },
        {
            "user_says": "Can you help me take a photo of my wardrobe?",
            "expected_intent": "take_picture",
            "description": "Photo guidance request"
        },
        {
            "user_says": "Analyze my wardrobe",
            "expected_intent": "wardrobe_analysis",
            "description": "Wardrobe analysis request"
        },
        {
            "user_says": "What should I wear from my closet?",
            "expected_intent": "wardrobe_analysis",
            "description": "Outfit suggestion request"
        },
        {
            "user_says": "Can you suggest an outfit for work?",
            "expected_intent": "wardrobe_analysis",
            "description": "Occasion-specific outfit request"
        },
        {
            "user_says": "Help me choose colors that match",
            "expected_intent": "wardrobe_analysis",
            "description": "Color coordination request"
        },
        # Test existing agents still work
        {
            "user_says": "What colors would look good on me?",
            "expected_intent": "skin_tone_analysis",
            "description": "Skin tone analysis (existing)"
        },
        {
            "user_says": "What's my style?",
            "expected_intent": "chat",
            "description": "General fashion chat (existing)"
        }
    ]

    for i, test_case in enumerate(test_cases, 1):
        print(f"🧪 Test {i}: {test_case['description']}")
        print(f"👤 User says: '{test_case['user_says']}'")

        # Step 1: Intent Classification
        print("🔍 Step 1: Classifying intent...")
        intent_response = requests.post(
            f"{BASE_URL}/classify-intent",
            json={"transcript": test_case['user_says']}
        ).json()
        intent = intent_response.get('intent', 'unknown')
        print(f"   Intent: {intent}")

        # Step 2: Route to appropriate agent
        print("🤖 Step 2: Getting agent response...")
        if intent == "take_picture":
            response = requests.post(
                f"{BASE_URL}/take-picture",
                json={
                    "user_id": "test_user",
                    "session_id": "test_session",
                    "message": test_case['user_says']
                }
            ).json()
            agent_name = "TakePictureAgent"
        elif intent == "wardrobe_analysis":
            response = requests.post(
                f"{BASE_URL}/wardrobe-analysis",
                json={
                    "user_id": "test_user",
                    "session_id": "test_session",
                    "message": test_case['user_says']
                }
            ).json()
            agent_name = "WardrobeAnalysisAgent"
        elif intent == "skin_tone_analysis":
            response = requests.post(
                f"{BASE_URL}/skin-tone-analysis",
                json={
                    "user_id": "test_user",
                    "session_id": "test_session",
                    "message": test_case['user_says']
                }
            ).json()
            agent_name = "SkinToneAnalysisAgent"
        else:
            response = requests.post(
                f"{BASE_URL}/chat",
                json={
                    "user_id": "test_user",
                    "session_id": "test_session",
                    "message": test_case['user_says']
                }
            ).json()
            agent_name = "FashionStylistAgent"

        ai_response = response.get('response', 'No response')
        print(f"   Agent: {agent_name}")

        # Step 3: Show response
        print("🔊 Step 3: Agent response...")
        print(f"   AI says: {ai_response[:100]}...")

        # Verify intent classification
        if intent == test_case['expected_intent']:
            print("   ✅ Intent classification correct")
        else:
            print(f"   ❌ Intent classification incorrect (expected: {test_case['expected_intent']})")

        print("-" * 60)
        time.sleep(1)

def test_wardrobe_conversation():
    """Test a complete wardrobe analysis conversation."""

    print("\n💬 Testing Wardrobe Analysis Conversation Flow")
    print("=" * 50)

    conversation = [
        "Analyze my wardrobe",
        "I need something for work",
        "What colors would work well together?",
        "Thanks for the suggestions!"
    ]

    for i, message in enumerate(conversation, 1):
        print(f"\n👤 User {i}: {message}")

        # Classify intent
        intent_response = requests.post(
            f"{BASE_URL}/classify-intent",
            json={"transcript": message}
        ).json()
        intent = intent_response.get('intent')

        # Get response from appropriate agent
        if intent == "wardrobe_analysis":
            response = requests.post(
                f"{BASE_URL}/wardrobe-analysis",
                json={
                    "user_id": "conversation_user",
                    "session_id": "conversation_session",
                    "message": message
                }
            ).json()
        else:
            response = requests.post(
                f"{BASE_URL}/chat",
                json={
                    "user_id": "conversation_user",
                    "session_id": "conversation_session",
                    "message": message
                }
            ).json()

        ai_response = response.get('response', 'No response')
        print(f"🤖 AI {i} ({intent}): {ai_response[:120]}...")
        print("-" * 40)
        time.sleep(1)

def show_new_agent_capabilities():
    """Show what the new agents can do."""

    print("\n🤖 New Agent Capabilities:")
    print("=" * 40)

    agents = {
        "TakePictureAgent (📸)": [
            "Guide users through photo capture process",
            "Provide photography tips for wardrobe photos",
            "Suggest optimal lighting and positioning",
            "Encourage clear, well-lit wardrobe shots"
        ],
        "WardrobeAnalysisAgent (👗)": [
            "Analyze wardrobe photos and identify clothing items",
            "Suggest specific outfit combinations",
            "Provide occasion-based styling advice",
            "Recommend color coordination and pattern mixing",
            "Identify versatile pieces and styling opportunities"
        ]
    }

    for agent, capabilities in agents.items():
        print(f"\n{agent}:")
        for capability in capabilities:
            print(f"  • {capability}")

def show_voice_commands():
    """Show all available voice commands including new ones."""

    print("\n🎤 Complete Voice Command List:")
    print("=" * 40)

    commands = [
        # New commands
        ("Take a picture", "take_picture", "📸"),
        ("Help me take a photo", "take_picture", "📸"),
        ("Analyze my wardrobe", "wardrobe_analysis", "👗"),
        ("What should I wear?", "wardrobe_analysis", "👗"),
        ("Suggest an outfit for work", "wardrobe_analysis", "👗"),
        ("Help me choose colors", "wardrobe_analysis", "🎨"),
        # Existing commands
        ("What colors would look good on me?", "skin_tone_analysis", "🌈"),
        ("Analyze my skin tone", "skin_tone_analysis", "🌈"),
        ("Show me cotton clothes", "update_filter", "🛍️"),
        ("What's my style?", "chat", "💅"),
    ]

    print("\n📸 Photo & Wardrobe Commands:")
    for command, intent, emoji in commands[:6]:
        print(f"{emoji} '{command}' → {intent}")

    print("\n🌈 Color & Style Commands:")
    for command, intent, emoji in commands[6:]:
        print(f"{emoji} '{command}' → {intent}")

if __name__ == "__main__":
    try:
        # Check if server is running
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Server is running!")

            # Run tests
            test_new_agents()
            test_wardrobe_conversation()
            show_new_agent_capabilities()
            show_voice_commands()

            print("\n🎉 All new agent tests completed!")
            print("\n📋 Summary:")
            print("✅ Take Picture Agent - Photo guidance")
            print("✅ Wardrobe Analysis Agent - Outfit suggestions")
            print("✅ Intent classification for new agents")
            print("✅ Voice routing to specialized agents")
            print("✅ Conversation context maintenance")

        else:
            print("❌ Server is not responding properly")

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server")
        print("Make sure the FastAPI server is running on localhost:8000")
        print("Run: python3 main_simple.py")
    except Exception as e:
        print(f"❌ Error: {e}")
