"use client"
import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Volume2, VolumeX, Camera, Check } from "lucide-react"
import AnimatedBackground from "./components/AnimatedBackground"
import VoiceAgent from "./components/VoiceAgent"
import BottomTabBar from "./components/BottomTabBar"

// Type definitions for SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string
      }
      isFinal: boolean
    }
  }
}

interface SpeechRecognitionErrorEvent {
  error: string
}

export default function HomePage() {
  const [micEnabled, setMicEnabled] = useState(false)
  const [speakerEnabled, setSpeakerEnabled] = useState(true)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [showCaptureNotification, setShowCaptureNotification] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize camera and microphone streams
  useEffect(() => {
    const startMediaStreams = async () => {
      try {
        // Request both video and audio permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })

        setCameraStream(stream)
        setAudioStream(stream)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('Error accessing media devices:', error)
        // Fallback to video only if audio fails
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          })
          setCameraStream(videoStream)
          if (videoRef.current) {
            videoRef.current.srcObject = videoStream
          }
        } catch (videoError) {
          console.error('Error accessing camera:', videoError)
        }
      }
    }

    startMediaStreams()

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Handle microphone mute/unmute
  const toggleMicrophone = () => {
    if (audioStream) {
      const audioTracks = audioStream.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      setMicEnabled(!micEnabled)
    }
  }

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraStream) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL (base64 image)
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageDataUrl)

        // Show notification
        setShowCaptureNotification(true)

        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowCaptureNotification(false)
        }, 3000)

        console.log('Photo captured! Image data:', imageDataUrl.substring(0, 100) + '...')
      }
    } else {
      console.error('Cannot capture photo: video or canvas not available')
    }
  }

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''

        const resultKeys = Object.keys(event.results)
        for (let i = event.resultIndex; i < resultKeys.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript)
          // Process voice commands here
          processVoiceCommand(finalTranscript.toLowerCase())
        }
      }

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start()
        }
      }
    }
  }, [isListening])

  // Process voice commands
  const processVoiceCommand = (command: string) => {
    console.log('Processing command:', command)

    if (command.includes('analyze') && command.includes('color')) {
      // Navigate to color analysis
      window.location.href = '/color-analysis'
    } else if (command.includes('party') && command.includes('outfit')) {
      // Navigate to swipe or closet
      window.location.href = '/swipe'
    } else if (command.includes('trending')) {
      // Navigate to community
      window.location.href = '/community'
    } else if (command.includes('closet')) {
      // Navigate to closet
      window.location.href = '/closet'
    }
  }

  // Toggle voice listening
  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Preview - Full Screen Background */}
      <div className="absolute inset-0 z-0">
        {cameraStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror the camera
          />
        ) : (
          // Fallback placeholder when camera is not available
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse-glow">
                <Camera size={48} className="text-white" />
              </div>
              <p className="text-gray-300">Camera preview will appear here</p>
            </div>
          </div>
        )}

        {/* Dark translucent gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Voice Agent - Top Left */}
      <VoiceAgent
        capturedImage={capturedImage}
        onTriggerCapture={capturePhoto}
        onImageAnalyzed={() => {
          console.log('Image analysis completed')
          // Optionally clear the captured image after analysis
          // setCapturedImage(null)
        }}
      />

      {/* Centered Capture Button */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
        <button
          onClick={capturePhoto}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient flex items-center justify-center animate-pulse-glow shadow-2xl hover:scale-110 transition-transform duration-200"
          aria-label="Capture photo"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <Camera className="text-black" size={28} />
          </div>
        </button>
      </div>

      {/* Capture Notification */}
      {showCaptureNotification && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="glass-card rounded-2xl p-6 backdrop-blur-md bg-white/10 border border-white/20 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Photo Captured!</h3>
                <p className="text-gray-300 text-sm">Your image has been saved</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Control Bar - Above Bottom Tab Bar */}
      <div className="absolute bottom-24 left-0 right-0 px-6 z-40">
        <div className="glass-card rounded-3xl p-4 backdrop-blur-md bg-white/10 border border-white/20">
          <div className="flex justify-around items-center">
            {/* Mic Toggle */}
            <button
              onClick={toggleMicrophone}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                micEnabled
                  ? "bg-gradient-to-r from-red-500 to-pink-500 animate-pulse-glow"
                  : "bg-white/20 hover:bg-white/30"
              }`}
              aria-label="Toggle microphone"
            >
              {micEnabled ? <Mic className="text-white" size={24} /> : <MicOff className="text-gray-400" size={24} />}
            </button>

            {/* Speaker Toggle */}
            <button
              onClick={() => setSpeakerEnabled(!speakerEnabled)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                speakerEnabled ? "bg-gradient-to-r from-green-500 to-blue-500" : "bg-white/20 hover:bg-white/30"
              }`}
              aria-label="Toggle speaker"
            >
              {speakerEnabled ? (
                <Volume2 className="text-white" size={24} />
              ) : (
                <VolumeX className="text-gray-400" size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </div>
  )
}
