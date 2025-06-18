"use client"
import { useRef, useEffect, useState, useCallback } from 'react'

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void
  onRetake: () => void
  capturedImage: string | null
}

export default function CameraCapture({ onCapture, onRetake, capturedImage }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (isInitialized || capturedImage) return // Don't reinitialize if already done or if image is captured
    
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
        setIsInitialized(true)
      } catch (error) {
        console.error("Error accessing camera:", error)
      }
    }
    startCamera()
  }, [isInitialized, capturedImage])

  // Cleanup function
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageDataUrl = canvas.toDataURL('image/jpeg')
        onCapture(imageDataUrl)
        // Stop the camera stream after capture
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
          setStream(null)
          setIsInitialized(false)
        }
      }
    }
  }, [onCapture, stream])

  const handleRetake = useCallback(() => {
    onRetake()
    setIsInitialized(false)
  }, [onRetake])

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="rounded-2xl w-full border border-white/10" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="rounded-2xl w-full border border-white/10" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-4 mt-6">
        {capturedImage ? (
          <button 
            onClick={handleRetake} 
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl text-white font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 animate-pulse-glow"
          >
            📸 Retake Photo
          </button>
        ) : (
          <button 
            onClick={handleCapture} 
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-semibold hover:from-purple-400 hover:to-pink-400 transition-all duration-300 animate-pulse-glow"
          >
            📷 Capture Photo
          </button>
        )}
      </div>
    </div>
  )
} 