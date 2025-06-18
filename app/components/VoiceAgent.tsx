"use client"
import { useState } from "react"
import { Mic, MicOff } from "lucide-react"

interface VoiceAgentProps {
  isListening: boolean
  onToggleListening: () => void
  transcript: string
}

export default function VoiceAgent({ isListening, onToggleListening, transcript }: VoiceAgentProps) {
  const [showTooltip, setShowTooltip] = useState(true)

  return (
    <div className="absolute top-6 left-6 z-50">
      <div className="relative">
        {/* Voice Bubble */}
        <button
          onClick={onToggleListening}
          className={`w-16 h-16 rounded-full glass-card flex items-center justify-center transition-all duration-300 ${
            isListening ? "animate-pulse-glow bg-gradient-to-r from-purple-500 to-pink-500" : "hover:scale-110"
          }`}
          aria-label="Voice Assistant"
        >
          {isListening ? <MicOff className="text-white" size={24} /> : <Mic className="text-purple-400" size={24} />}
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute top-20 left-0 w-64 glass-card rounded-2xl p-4 animate-fade-in backdrop-blur-md bg-white/10 border border-white/20">
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Close tooltip"
            >
              ×
            </button>
            <p className="text-sm text-gray-200 mb-2">
              <span className="gradient-text font-bold">Hi! I'm your AI stylist.</span>
            </p>
            <p className="text-xs text-gray-300">
              Try saying:
              <br />
              "Analyze my color tone"
              <br />
              "Find me party outfits"
              <br />
              "What's trending?"
            </p>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="absolute top-20 left-0 w-80 glass-card rounded-2xl p-4 animate-fade-in backdrop-blur-md bg-white/10 border border-white/20 mt-2">
            <p className="text-sm text-gray-200">
              <span className="font-bold">You said:</span> {transcript}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
