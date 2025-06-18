// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  length: number
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface Window {
  webkitSpeechRecognition: new () => SpeechRecognition
  SpeechRecognition: new () => SpeechRecognition
}

export class VoiceService {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis | null = null
  private isListening = false
  private isSpeaking = false

  constructor() {
    this.initializeSpeechRecognition()
    this.initializeSpeechSynthesis()
  }

  private initializeSpeechRecognition() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition()
      if (this.recognition) {
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = 'en-US'
      }
    } else if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition()
      if (this.recognition) {
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = 'en-US'
      }
    }
  }

  private initializeSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  public startListening(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition not supported in this browser')
      return false
    }

    if (this.isListening) {
      return false
    }

    this.isListening = true

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
      this.isListening = false
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError(`Speech recognition error: ${event.error}`)
      this.isListening = false
    }

    this.recognition.onend = () => {
      this.isListening = false
      onEnd()
    }

    this.recognition.start()
    return true
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  public speak(text: string, onEnd?: () => void): boolean {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported in this browser')
      return false
    }

    if (this.isSpeaking) {
      this.synthesis.cancel()
    }

    this.isSpeaking = true

    const utterance = new SpeechSynthesisUtterance(text)

    // Fun voice settings: high pitch, fast rate for energetic fashion assistant
    utterance.rate = 1.3    // Faster rate for excitement
    utterance.pitch = 1.4   // Higher pitch to make it fun and bubbly
    utterance.volume = 1.0

    // Try to find fun, energetic voices like in the reference code
    const voices = this.synthesis.getVoices()
    const funVoice = voices.find(voice =>
      voice.name.toLowerCase().includes("fred") ||
      voice.name.toLowerCase().includes("google uk english female") ||
      voice.name.toLowerCase().includes("trinoids") ||
      voice.name.toLowerCase().includes("samantha") ||
      voice.name.toLowerCase().includes("victoria") ||
      voice.name.toLowerCase().includes("tessa") ||
      voice.name.toLowerCase().includes("karen") ||
      voice.name.toLowerCase().includes("alex") ||
      voice.name.toLowerCase().includes("fiona") ||
      (voice.lang === 'en-US' && voice.name.toLowerCase().includes("female")) ||
      (voice.lang === 'en-GB' && voice.name.toLowerCase().includes("female"))
    ) || voices.find(voice => voice.lang === 'en-US') || voices[Math.floor(Math.random() * voices.length)]

    if (funVoice) {
      utterance.voice = funVoice
      console.log(`🎤 Using fun voice: ${funVoice.name} (${funVoice.lang})`)
    }

    utterance.onend = () => {
      this.isSpeaking = false
      if (onEnd) onEnd()
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      this.isSpeaking = false
      if (onEnd) onEnd()
    }

    this.synthesis.speak(utterance)
    return true
  }

  public stopSpeaking(): void {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel()
      this.isSpeaking = false
    }
  }

  public isListeningNow(): boolean {
    return this.isListening
  }

  public isSpeakingNow(): boolean {
    return this.isSpeaking
  }

  public isSupported(): boolean {
    return !!(this.recognition && this.synthesis)
  }
}

// Create a singleton instance
export const voiceService = new VoiceService()
