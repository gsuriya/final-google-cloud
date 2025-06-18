# Next.js web app

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/suriyas-projects-8944df7c/v0-next-js-web-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/YA79bHkAVIf)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Features

### 🎤 Voice Interface
- **Speech Recognition**: Real-time voice input with transcript display
- **Text-to-Speech**: Natural voice responses with fun, energetic personality
- **Intent Classification**: Automatically routes requests to appropriate agents
- **Session Management**: Maintains conversation context for both fashion chat and color analysis

### 🎨 Specialized Agents

#### **FashionStylistAgent**
- General fashion advice and style recommendations
- Outfit coordination and trend analysis
- Wardrobe organization tips
- Shopping recommendations

#### **SkinToneAnalysisAgent** (NEW!)
- **Color Season Analysis**: Spring, Summer, Autumn, Winter identification
- **Undertone Detection**: Warm, cool, neutral, olive undertone analysis
- **Personalized Color Palettes**: Clothing, makeup, and accessory recommendations
- **Interactive Analysis**: Asks follow-up questions for detailed recommendations

#### **IntentClassifierAgent**
- Routes user requests to appropriate specialized agents
- Supports: `skin_tone_analysis`, `update_filter`, `chat`

#### **FilterExtractionAgent**
- Extracts clothing filter preferences (material, store, sustainability)

## How to Use

### Voice Commands
- Click the microphone button in the top-left corner
- Speak your fashion-related questions or requests
- The AI will classify your intent and respond appropriately

### Try These Voice Commands:
- **"What colors would look good on me?"** 🌈 (triggers skin tone analysis)
- **"Analyze my skin tone"** 🎨 (detailed color analysis)
- **"What's my undertone?"** 💫 (undertone guidance)
- **"What's my color season?"** ✨ (season analysis)
- **"Show me cotton clothes"** 👗 (filter extraction)
- **"What's my style?"** 💅 (general fashion chat)

## Architecture

```
Voice Input → Speech Recognition → Intent Classification → Agent Routing → Response Generation → Text-to-Speech
```

### Agent Flow:
1. **Voice Input**: User speaks into microphone
2. **Intent Classification**: System determines user intent
3. **Agent Routing**:
   - `skin_tone_analysis` → SkinToneAnalysisAgent
   - `update_filter` → FilterExtractionAgent
   - `chat` → FashionStylistAgent
4. **Response Generation**: Specialized agent provides detailed response
5. **Voice Output**: Response is spoken back to user

### Session Management:
- **FashionStylistAgent**: Maintains conversation context for general fashion chat
- **SkinToneAnalysisAgent**: Maintains separate conversation context for color analysis
- **Reset Button**: Clears both conversation contexts

## API Endpoints

### Core Endpoints
- `POST /chat` - General fashion chat
- `POST /skin-tone-analysis` - Specialized color analysis
- `POST /classify-intent` - Intent classification
- `POST /extract-filter` - Filter extraction

### Health & Status
- `GET /` - API status and available agents
- `GET /health` - Health check

## Skin Tone Analysis Features

### What the Agent Can Analyze:
- **Skin Tone**: Fair, light, medium, tan, deep
- **Undertones**: Warm, cool, neutral, olive
- **Color Seasons**: Spring, Summer, Autumn, Winter
- **Personal Recommendations**: Clothing, makeup, accessories

### Interactive Analysis Process:
1. **Initial Assessment**: Asks about skin tone, sun reaction, vein color
2. **Undertone Analysis**: Gold vs silver jewelry test, vein color analysis
3. **Color Season**: Determines best color palette based on analysis
4. **Personalized Recommendations**: Specific colors and products

## Deployment

Your project is live at:

**[https://vercel.com/suriyas-projects-8944df7c/v0-next-js-web-app](https://vercel.com/suriyas-projects-8944df7c/v0-next-js-web-app)**

## Local Development

### Prerequisites
- Python 3.9+
- Node.js 18+
- Google Cloud Project (for ADK agents)

### Setup
1. Clone the repository
2. Install Python dependencies: `pip install -r requirements.txt`
3. Install Node.js dependencies: `npm install`
4. Set up environment variables for Google Cloud
5. Start the FastAPI server: `python3 main_simple.py`
6. Start the Next.js app: `npm run dev`

### Environment Variables
```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=your-location
```

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/YA79bHkAVIf](https://v0.dev/chat/projects/YA79bHkAVIf)**

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: FastAPI, Python
- **AI Agents**: Google Agent Development Kit (ADK)
- **Voice**: Web Speech API
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Agent Capabilities

### FashionStylistAgent
- Style advice and recommendations
- Outfit coordination
- Fashion trend analysis
- Wardrobe organization
- Shopping guidance

### SkinToneAnalysisAgent
- Color season identification
- Undertone analysis
- Personalized color palettes
- Makeup color recommendations
- Jewelry and accessory guidance

### IntentClassifierAgent
- Natural language intent recognition
- Multi-intent support
- Context-aware classification

### FilterExtractionAgent
- Clothing filter extraction
- Material preferences
- Store preferences
- Sustainability preferences
