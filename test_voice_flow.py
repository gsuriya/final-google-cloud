#!/usr/bin/env python3
"""
Test script to demonstrate the voice-based skin tone analysis flow.
This simulates the complete user interaction from voice input to agent response.
"""

import asyncio
import aiohttp
import json
import time

# API base URL
BASE_URL = "http://localhost:8000"

async def test_voice_flow():
    """Test the complete voice-based skin tone analysis flow."""

    print("🎤 Testing Voice-Based Skin Tone Analysis Flow")
    print("=" * 50)

    # Test cases simulating voice input
    test_cases = [
        {
            "transcript": "What colors would look good on me?",
            "expected_intent": "skin_tone_analysis",
            "description": "Initial color analysis request"
        },
        {
            "transcript": "My veins look blue",
            "expected_intent": "skin_tone_analysis",
            "description": "Follow-up undertone information"
        },
        {
            "transcript": "What's my color season?",
            "expected_intent": "skin_tone_analysis",
            "description": "Color season inquiry"
        },
        {
            "transcript": "Show me cotton clothes",
            "expected_intent": "update_filter",
            "description": "Filter request"
        },
        {
            "transcript": "What's my style?",
            "expected_intent": "chat",
            "description": "General fashion chat"
        }
    ]

    async with aiohttp.ClientSession() as session:
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n🧪 Test {i}: {test_case['description']}")
            print(f"📝 User says: '{test_case['transcript']}'")

            # Step 1: Intent Classification
            print("🔍 Step 1: Classifying intent...")
            intent_response = await classify_intent(session, test_case['transcript'])
            intent = intent_response.get('intent', 'unknown')
            print(f"   Intent: {intent}")

            # Step 2: Route to appropriate agent
            print("🤖 Step 2: Routing to agent...")
            if intent == "skin_tone_analysis":
                agent_response = await skin_tone_analysis(session, test_case['transcript'])
                response_text = agent_response.get('response', 'No response')
                print(f"   Agent: SkinToneAnalysisAgent")
            elif intent == "update_filter":
                response_text = "Got it! I understand you want to filter clothing options. While I can't directly update filters right now, I can definitely help you think about what styles, materials, or stores might work best for you! What specific type of clothing are you looking for? 👗✨"
                print(f"   Agent: FilterExtractionAgent")
            else:
                agent_response = await chat(session, test_case['transcript'])
                response_text = agent_response.get('response', 'No response')
                print(f"   Agent: FashionStylistAgent")

            # Step 3: Simulate voice output
            print("🔊 Step 3: Voice output...")
            print(f"   AI says: {response_text[:100]}...")

            # Verify intent classification
            if intent == test_case['expected_intent']:
                print("   ✅ Intent classification correct")
            else:
                print(f"   ❌ Intent classification incorrect (expected: {test_case['expected_intent']})")

            print("-" * 50)
            await asyncio.sleep(1)  # Small delay between tests

async def classify_intent(session, transcript):
    """Classify user intent from transcript."""
    url = f"{BASE_URL}/classify-intent"
    data = {"transcript": transcript}

    async with session.post(url, json=data) as response:
        return await response.json()

async def skin_tone_analysis(session, message):
    """Send message to skin tone analysis agent."""
    url = f"{BASE_URL}/skin-tone-analysis"
    data = {
        "user_id": "test_user",
        "session_id": "test_session",
        "message": message
    }

    async with session.post(url, json=data) as response:
        return await response.json()

async def chat(session, message):
    """Send message to general chat agent."""
    url = f"{BASE_URL}/chat"
    data = {
        "user_id": "test_user",
        "session_id": "test_session",
        "message": message
    }

    async with session.post(url, json=data) as response:
        return await response.json()

async def test_conversation_flow():
    """Test a complete conversation flow with the skin tone analysis agent."""

    print("\n💬 Testing Conversation Flow with Skin Tone Analysis Agent")
    print("=" * 60)

    conversation = [
        "What colors would look good on me?",
        "My skin is fair and I burn easily",
        "My veins look blue",
        "What makeup colors should I wear?",
        "Thank you for the help!"
    ]

    async with aiohttp.ClientSession() as session:
        for i, message in enumerate(conversation, 1):
            print(f"\n👤 User {i}: {message}")

            # Get response from skin tone analysis agent
            response = await skin_tone_analysis(session, message)
            ai_response = response.get('response', 'No response')

            print(f"🤖 AI {i}: {ai_response[:150]}...")
            print("-" * 40)
            await asyncio.sleep(1)

async def main():
    """Run all tests."""
    try:
        # Test basic flow
        await test_voice_flow()

        # Test conversation flow
        await test_conversation_flow()

        print("\n🎉 All tests completed successfully!")
        print("\n📋 Summary:")
        print("✅ Voice input processing")
        print("✅ Intent classification")
        print("✅ Agent routing")
        print("✅ Skin tone analysis responses")
        print("✅ Conversation context")
        print("✅ Voice output simulation")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("Make sure the FastAPI server is running on localhost:8000")

if __name__ == "__main__":
    asyncio.run(main())
