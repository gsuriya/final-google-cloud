"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react"
import { voiceService } from "../utils/voiceService"
import {
  ADKSessionManager,
  SkinToneSessionManager,
  TakePictureSessionManager,
  WardrobeAnalysisSessionManager,
  classifyIntent
} from "../utils/adkApi"

export default function VoiceAgent() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>("")
  const [lastIntent, setLastIntent] = useState<string>("")

  // ADK Session Managers for persistent conversations
  const sessionManagerRef = useRef<ADKSessionManager | null>(null)
  const skinToneSessionManagerRef = useRef<SkinToneSessionManager | null>(null)
  const takePictureSessionManagerRef = useRef<TakePictureSessionManager | null>(null)
  const wardrobeAnalysisSessionManagerRef = useRef<WardrobeAnalysisSessionManager | null>(null)

  useEffect(() => {
    // Initialize ADK session managers
    sessionManagerRef.current = new ADKSessionManager()
    skinToneSessionManagerRef.current = new SkinToneSessionManager()
    takePictureSessionManagerRef.current = new TakePictureSessionManager()
    wardrobeAnalysisSessionManagerRef.current = new WardrobeAnalysisSessionManager()
  }, [])

  // Check if voice features are supported
  const isVoiceSupported = voiceService.isSupported()

  const handleVoiceInput = useCallback(async (userTranscript: string) => {
    if (!userTranscript.trim() || !sessionManagerRef.current || !skinToneSessionManagerRef.current ||
        !takePictureSessionManagerRef.current || !wardrobeAnalysisSessionManagerRef.current) return

    setTranscript(userTranscript)
    setIsProcessing(true)
    setError(null)

    try {
      // First, classify the intent
      const intent = await classifyIntent(userTranscript)
      setLastIntent(intent)

      // Handle different intents
      let aiResponse: string

      if (intent === 'skin_tone_analysis') {
        // Use the skin tone analysis session manager for persistent color conversations
        aiResponse = await skinToneSessionManagerRef.current.sendMessage(userTranscript)
      } else if (intent === 'take_picture') {
        // Use the take picture session manager for photo guidance
        aiResponse = await takePictureSessionManagerRef.current.sendMessage(userTranscript)
      } else if (intent === 'wardrobe_analysis') {
        // Use the wardrobe analysis session manager for outfit suggestions
        aiResponse = await wardrobeAnalysisSessionManagerRef.current.sendMessage(userTranscript)
      } else if (intent === 'update_filter') {
        aiResponse = "Got it! I understand you want to filter clothing options. While I can't directly update filters right now, I can definitely help you think about what styles, materials, or stores might work best for you! What specific type of clothing are you looking for? 👗✨"
      } else {
        // For 'chat' intent, use the fashion stylist agent
        aiResponse = await sessionManagerRef.current.sendMessage(userTranscript)
      }

      // Speak the response
      voiceService.speak(aiResponse, () => {
        setIsSpeaking(false)
      })
      setIsSpeaking(true)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from fashion assistant'
      setError(errorMessage)
      console.error('Voice conversation error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      voiceService.stopListening()
      setIsListening(false)
    } else {
      // Stop any current speech
      voiceService.stopSpeaking()
      setIsSpeaking(false)

      const success = voiceService.startListening(
        (transcript) => {
          setIsListening(false)
          handleVoiceInput(transcript)
        },
        (error) => {
          setIsListening(false)
          setError(error)
        },
        () => {
          setIsListening(false)
        }
      )

      if (success) {
        setIsListening(true)
        setError(null)
      }
    }
  }, [isListening, handleVoiceInput])

  // Reset session function
  const resetSession = useCallback(() => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.resetSession()
    }
    if (skinToneSessionManagerRef.current) {
      skinToneSessionManagerRef.current.resetSession()
    }
    if (takePictureSessionManagerRef.current) {
      takePictureSessionManagerRef.current.resetSession()
    }
    if (wardrobeAnalysisSessionManagerRef.current) {
      wardrobeAnalysisSessionManagerRef.current.resetSession()
    }
    setTranscript("")
    setError(null)
    setLastIntent("")
    console.log('All ADK sessions reset')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceService.stopListening()
      voiceService.stopSpeaking()
    }
  }, [])

  if (!isVoiceSupported) {
    return (
      <div className="fixed top-6 left-6 z-40">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-sm text-red-400">
            Voice features not supported in this browser
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-6 left-6 z-40">
      <div className="relative">
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`w-16 h-16 rounded-full glass-card flex items-center justify-center transition-all duration-300 ${
            isListening ? "pulse-glow scale-110 bg-red-500/20" :
            isSpeaking ? "bg-blue-500/20" :
            isProcessing ? "bg-yellow-500/20" :
            "hover:scale-105"
          } ${isProcessing ? "cursor-not-allowed" : "cursor-pointer"}`}
          aria-label="Voice Assistant"
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
          ) : isSpeaking ? (
            <Volume2 className="w-6 h-6 text-blue-400" />
          ) : isListening ? (
            <Mic className="w-6 h-6 text-red-400" />
          ) : (
            <MicOff className="w-6 h-6 text-gray-400" />
          )}
        </button>

        {/* Reset session button */}
        <button
          onClick={resetSession}
          className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white hover:bg-purple-600 transition-colors"
          title="Reset conversation"
        >
          ↻
        </button>

        {/* Status indicators */}
        {isListening && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        )}
        {isSpeaking && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
        )}
        {isProcessing && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
        )}

        {/* Error message */}
        {error && (
          <div className="absolute top-20 left-0 w-64 glass-card rounded-2xl p-4 animate-in slide-in-from-top-2">
            <div className="text-sm text-red-400">
              <p className="font-semibold mb-2">Error:</p>
              <p>{error}</p>
              <p className="text-xs mt-2 text-gray-400">Make sure your ADK FastAPI server is running on localhost:8000</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* Transcript display with intent */}
        {transcript && !error && (
          <div className="absolute top-20 left-0 w-64 glass-card rounded-2xl p-4 animate-in slide-in-from-top-2">
            <div className="text-sm text-gray-200">
              <p className="font-semibold text-purple-400 mb-2">You said:</p>
              <p className="italic mb-2">{transcript}</p>
              {lastIntent && (
                <p className="text-xs text-green-400">Intent: {lastIntent}</p>
              )}
            </div>
            <button
              onClick={() => setTranscript("")}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Close transcript"
            >
              ×
            </button>
          </div>
        )}

        {/* Initial tooltip */}
        {showTooltip && !isListening && !isSpeaking && !isProcessing && !transcript && !error && (
          <div className="absolute top-20 left-0 w-64 glass-card rounded-2xl p-4 animate-in slide-in-from-top-2">
            <div className="text-sm text-gray-200">
              <p className="font-semibold text-purple-400 mb-2">Hey fashionista! 👋✨</p>
              <p className="mb-2">Chat with your AI fashion agent powered by Google ADK!</p>
              <p className="text-purple-300 italic text-xs mb-2">Try saying:</p>
              <p className="text-purple-300 italic text-xs">"What's my skin tone?" 🌈</p>
              <p className="text-purple-300 italic text-xs">"Take a picture" 📸</p>
              <p className="text-purple-300 italic text-xs">"Analyze my wardrobe" 👗</p>
              <p className="text-purple-300 italic text-xs">"What should I wear?" ✨</p>
              <p className="text-purple-300 italic text-xs">"Show me cotton clothes" 🛍️</p>
              <p className="text-purple-300 italic text-xs">"What's my style?" 💅</p>
              <p className="text-xs text-gray-400 mt-2">Uses Google Agent Development Kit</p>
            </div>
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Close tooltip"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
