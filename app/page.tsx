"use client"
import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Volume2, VolumeX, Camera } from "lucide-react"
import AnimatedBackground from "./components/AnimatedBackground"
import VoiceAgent from "./components/VoiceAgent"
import BottomTabBar from "./components/BottomTabBar"

export default function HomePage() {
  const [micEnabled, setMicEnabled] = useState(false)
  const [speakerEnabled, setSpeakerEnabled] = useState(true)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Initialize camera stream
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
        setCameraStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
        // Fallback to placeholder if camera access fails
      }
    }

    startCamera()

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="relative h-screen overflow-hidden">
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
      <VoiceAgent />

      {/* Centered Capture Button */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
        <button
          className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient flex items-center justify-center animate-pulse-glow shadow-2xl"
          aria-label="Capture photo"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <Camera className="text-black" size={28} />
          </div>
        </button>
      </div>

      {/* Bottom Control Bar - Above Bottom Tab Bar */}
      <div className="absolute bottom-24 left-0 right-0 px-6 z-40">
        <div className="glass-card rounded-3xl p-4 backdrop-blur-md bg-white/10 border border-white/20">
          <div className="flex justify-around items-center">
            {/* Mic Toggle */}
            <button
              onClick={() => setMicEnabled(!micEnabled)}
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
