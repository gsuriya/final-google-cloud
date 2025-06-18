// ADK Agent API configuration
const ADK_BASE_URL = process.env.NEXT_PUBLIC_ADK_BASE_URL || 'http://127.0.0.1:8000'

export interface ADKChatRequest {
  user_id: string
  session_id: string
  message: string
}

export interface ADKChatResponse {
  response: string
}

export interface ADKIntentRequest {
  transcript: string
}

export interface ADKIntentResponse {
  intent: 'skin_tone_analysis' | 'take_picture' | 'wardrobe_analysis' | 'update_filter' | 'chat'
}

// Generate unique IDs for user and session
function generateId(): string {
  return Math.random().toString().slice(2)
}

export async function sendChatMessage(message: string, userId?: string, sessionId?: string): Promise<string> {
  const request: ADKChatRequest = {
    user_id: userId || generateId(),
    session_id: sessionId || generateId(),
    message
  }

  try {
    const response = await fetch(`${ADK_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ADK Agent error: ${response.status} - ${errorText}`)
    }

    const result: ADKChatResponse = await response.json()
    return result.response
  } catch (error) {
    console.error('ADK API error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to ADK agent')
  }
}

export async function classifyIntent(transcript: string): Promise<string> {
  const request: ADKIntentRequest = {
    transcript
  }

  try {
    const response = await fetch(`${ADK_BASE_URL}/classify-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Intent classification error: ${response.status} - ${errorText}`)
    }

    const result: ADKIntentResponse = await response.json()
    return result.intent
  } catch (error) {
    console.error('Intent classification error:', error)
    return 'chat' // Default to chat if classification fails
  }
}

export async function sendSkinToneAnalysis(message: string, userId?: string, sessionId?: string): Promise<string> {
  const request: ADKChatRequest = {
    user_id: userId || generateId(),
    session_id: sessionId || generateId(),
    message
  }

  try {
    const response = await fetch(`${ADK_BASE_URL}/skin-tone-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Skin tone analysis error: ${response.status} - ${errorText}`)
    }

    const result: ADKChatResponse = await response.json()
    return result.response
  } catch (error) {
    console.error('Skin tone analysis error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to skin tone analysis agent')
  }
}

export async function sendTakePictureRequest(message: string, userId?: string, sessionId?: string): Promise<string> {
  const request: ADKChatRequest = {
    user_id: userId || generateId(),
    session_id: sessionId || generateId(),
    message
  }

  try {
    const response = await fetch(`${ADK_BASE_URL}/take-picture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Take picture error: ${response.status} - ${errorText}`)
    }

    const result: ADKChatResponse = await response.json()
    return result.response
  } catch (error) {
    console.error('Take picture error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to take picture agent')
  }
}

export async function sendWardrobeAnalysis(message: string, userId?: string, sessionId?: string): Promise<string> {
  const request: ADKChatRequest = {
    user_id: userId || generateId(),
    session_id: sessionId || generateId(),
    message
  }

  try {
    const response = await fetch(`${ADK_BASE_URL}/wardrobe-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Wardrobe analysis error: ${response.status} - ${errorText}`)
    }

    const result: ADKChatResponse = await response.json()
    return result.response
  } catch (error) {
    console.error('Wardrobe analysis error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to wardrobe analysis agent')
  }
}

export async function sendSkinToneAnalysisWithImage(message: string, imageData: string, userId?: string, sessionId?: string): Promise<string> {
  const request = {
    user_id: userId || generateId(),
    session_id: sessionId || generateId(),
    message,
    image_data: imageData
  }

  try {
    const response = await fetch(`${ADK_BASE_URL}/skin-tone-analysis-with-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Skin tone analysis with image error: ${response.status} - ${errorText}`)
    }

    const result: ADKChatResponse = await response.json()
    return result.response
  } catch (error) {
    console.error('Skin tone analysis with image error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to skin tone analysis agent')
  }
}

export async function sendWardrobeAnalysisWithImage(message: string, imageData: string, userId?: string, sessionId?: string): Promise<string> {
  const request = {
    user_id: userId || generateId(),
    session_id: sessionId || generateId(),
    message,
    image_data: imageData
  }

  try {
    const response = await fetch(`${ADK_BASE_URL}/wardrobe-analysis-with-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Wardrobe analysis with image error: ${response.status} - ${errorText}`)
    }

    const result: ADKChatResponse = await response.json()
    return result.response
  } catch (error) {
    console.error('Wardrobe analysis with image error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to wardrobe analysis agent')
  }
}

// Session management for persistent conversations
class ADKSessionManager {
  private userId: string
  private sessionId: string

  constructor() {
    this.userId = generateId()
    this.sessionId = generateId()
  }

  async sendMessage(message: string): Promise<string> {
    return sendChatMessage(message, this.userId, this.sessionId)
  }

  resetSession(): void {
    this.sessionId = generateId()
  }

  getUserId(): string {
    return this.userId
  }

  getSessionId(): string {
    return this.sessionId
  }
}

// Session management for skin tone analysis conversations
class SkinToneSessionManager {
  private userId: string
  private sessionId: string

  constructor() {
    this.userId = generateId()
    this.sessionId = generateId()
  }

  async sendMessage(message: string): Promise<string> {
    return sendSkinToneAnalysis(message, this.userId, this.sessionId)
  }

  resetSession(): void {
    this.sessionId = generateId()
  }

  getUserId(): string {
    return this.userId
  }

  getSessionId(): string {
    return this.sessionId
  }
}

// Session management for take picture conversations
class TakePictureSessionManager {
  private userId: string
  private sessionId: string

  constructor() {
    this.userId = generateId()
    this.sessionId = generateId()
  }

  async sendMessage(message: string): Promise<string> {
    return sendTakePictureRequest(message, this.userId, this.sessionId)
  }

  resetSession(): void {
    this.sessionId = generateId()
  }

  getUserId(): string {
    return this.userId
  }

  getSessionId(): string {
    return this.sessionId
  }
}

// Session management for wardrobe analysis conversations
class WardrobeAnalysisSessionManager {
  private userId: string
  private sessionId: string

  constructor() {
    this.userId = generateId()
    this.sessionId = generateId()
  }

  async sendMessage(message: string): Promise<string> {
    return sendWardrobeAnalysis(message, this.userId, this.sessionId)
  }

  resetSession(): void {
    this.sessionId = generateId()
  }

  getUserId(): string {
    return this.userId
  }

  getSessionId(): string {
    return this.sessionId
  }
}

export { ADKSessionManager, SkinToneSessionManager, TakePictureSessionManager, WardrobeAnalysisSessionManager }
