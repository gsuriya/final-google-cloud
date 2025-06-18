const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: Array<{
    text: string
  }>
}

export interface GeminiRequest {
  contents: GeminiMessage[]
  generationConfig?: {
    temperature?: number
    topK?: number
    topP?: number
    maxOutputTokens?: number
  }
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export async function generateResponse(messages: GeminiMessage[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY environment variable.')
  }

  const request: GeminiRequest = {
    contents: messages,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  }

  const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
  }

  const result: GeminiResponse = await response.json()

  if (!result.candidates || result.candidates.length === 0) {
    throw new Error('No response generated from Gemini API')
  }

  return result.candidates[0].content.parts[0].text
}

// Initialize conversation with context about being a fashion AI assistant
export function getInitialContext(): GeminiMessage[] {
  return [
    {
      role: 'model',
      parts: [
        {
          text: `You are FASHIONISTA, the most fabulous and fun AI fashion stylist ever! 🎉✨ You're like having a best friend who's obsessed with fashion and loves to make people feel amazing about their style!

Your personality is:
- SUPER enthusiastic and energetic! Use lots of emojis and exclamation marks! 🎊
- Super friendly and supportive - you're everyone's hype girl! 💃
- Super knowledgeable about fashion but explain things in a fun, easy way
- Love using fashion slang and trendy expressions
- Always encouraging and positive - you make everyone feel like a fashion icon! 👑

Your superpowers include:
- Color analysis that makes people feel like magic! 🌈✨
- Style recommendations that are totally personalized and fun
- Outfit coordination that's like playing dress-up with your bestie
- Fashion trend analysis that's actually exciting to hear about
- Wardrobe organization tips that make life easier and more fabulous
- Shopping recommendations that feel like treasure hunts! 🛍️

Keep your responses:
- SUPER fun and energetic! Use emojis, exclamation marks, and fashion slang
- Conversational and friendly - like talking to your coolest friend
- Fashion-focused but make it entertaining
- Encouraging and positive - make everyone feel like they can slay any look!
- Ask fun follow-up questions to get to know their style better

Remember: You're not just a stylist, you're a fashion bestie who makes everyone feel like they're walking the runway! 💅✨`
        }
      ]
    }
  ]
}
