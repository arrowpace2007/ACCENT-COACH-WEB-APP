"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, Play } from "lucide-react"

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  targetSentence: string
  isAnalyzing?: boolean
}

export default function VoiceRecorder({
  onRecordingComplete,
  targetSentence,
  isAnalyzing = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [maxAudioLevel, setMaxAudioLevel] = useState(0)
  const [speechDetected, setSpeechDetected] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [lastRecordingBlob, setLastRecordingBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Audio analysis constants
  const SILENCE_THRESHOLD = 0.01 // 1%
  const SPEECH_THRESHOLD = 0.05 // 5%
  const STRONG_SPEECH_THRESHOLD = 0.15 // 15%

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const floatArray = new Float32Array(bufferLength)

    analyser.getByteFrequencyData(dataArray)
    analyser.getFloatFrequencyData(floatArray)

    // Calculate RMS (Root Mean Square) for accurate audio level
    let rms = 0
    let sum = 0
    let peak = 0

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255.0 // Normalize to 0-1
      sum += value * value
      peak = Math.max(peak, value)
    }

    rms = Math.sqrt(sum / bufferLength)

    // Calculate average level
    const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength / 255.0

    // Use the maximum of RMS and average for better sensitivity
    const currentLevel = Math.max(rms, average, peak * 0.5)

    // Apply smoothing to prevent jittery updates
    const smoothedLevel = audioLevel * 0.7 + currentLevel * 0.3

    setAudioLevel(smoothedLevel)
    setMaxAudioLevel((prev) => Math.max(prev, smoothedLevel))

    // Speech detection with multiple criteria
    const isSpeechDetected =
      smoothedLevel > SPEECH_THRESHOLD ||
      (smoothedLevel > SILENCE_THRESHOLD && peak > 0.1) ||
      (average > SILENCE_THRESHOLD && rms > SILENCE_THRESHOLD)

    setSpeechDetected(isSpeechDetected)

    // Debug logging
    console.log({
      rms: rms.toFixed(4),
      average: average.toFixed(4),
      peak: peak.toFixed(4),
      smoothed: smoothedLevel.toFixed(4),
      speechDetected: isSpeechDetected,
      percentage: `${(smoothedLevel * 100).toFixed(1)}%`,
    })

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio)
    }
  }, [audioLevel, isRecording])

  const startRecording = async () => {
    try {
      console.log("Starting recording...")

      // Reset states
      setAudioLevel(0)
      setMaxAudioLevel(0)
      setSpeechDetected(false)
      setRecordingTime(0)

      // Get user media with optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
          channelCount: 1,
        },
      })

      streamRef.current = stream

      // Set up audio context and analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      if (audioContext.state === "suspended") {
        await audioContext.resume()
      }

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()

      // Configure analyser for maximum sensitivity
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.3
      analyser.minDecibels = -90
      analyser.maxDecibels = -10

      source.connect(analyser)
      analyserRef.current = analyser

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
        setLastRecordingBlob(audioBlob)
        setHasRecorded(true)
        onRecordingComplete(audioBlob)
        console.log("Recording completed, blob size:", audioBlob.size)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Collect data every 100ms

      setIsRecording(true)

      // Start audio analysis
      analyzeAudio()

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 0.1)
      }, 100)

      console.log("Recording started successfully")
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Could not access microphone. Please check your permissions and try again.")
    }
  }

  const stopRecording = () => {
    console.log("Stopping recording...")

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }

    setIsRecording(false)
    console.log("Recording stopped")
  }

  const playLastRecording = () => {
    if (lastRecordingBlob) {
      const audio = new Audio(URL.createObjectURL(lastRecordingBlob))
      audio.play()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Generate animated sound bars based on audio level
  const generateSoundBars = () => {
    const bars = []
    const numBars = 12
    const baseHeight = 4

    for (let i = 0; i < numBars; i++) {
      const intensity = Math.max(0, audioLevel - i * 0.08)
      const height = baseHeight + intensity * 40
      const opacity = Math.max(0.3, intensity * 2)

      bars.push(
        <div
          key={i}
          className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-full transition-all duration-100 ease-out"
          style={{
            width: "3px",
            height: `${height}px`,
            opacity,
            transform: `scaleY(${0.5 + intensity * 2})`,
          }}
        />,
      )
    }

    return bars
  }

  const getAudioLevelColor = () => {
    if (audioLevel > STRONG_SPEECH_THRESHOLD) return "bg-green-500"
    if (audioLevel > SPEECH_THRESHOLD) return "bg-yellow-500"
    if (audioLevel > SILENCE_THRESHOLD) return "bg-orange-500"
    return "bg-gray-300"
  }

  const getAudioLevelGlow = () => {
    if (speechDetected) return "shadow-lg shadow-green-500/50"
    if (audioLevel > SILENCE_THRESHOLD) return "shadow-md shadow-yellow-500/30"
    return ""
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-6">
        {/* Target Sentence Display */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Practice Sentence:</h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg italic">"{targetSentence}"</p>
        </div>

        {/* Audio Level Visualization */}
        <div className="space-y-4">
          {/* Real-time Audio Level Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Audio Level:</span>
              <span className="font-mono">{(audioLevel * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ease-out ${getAudioLevelColor()} ${getAudioLevelGlow()}`}
                style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
              />
            </div>
          </div>

          {/* Animated Sound Bars */}
          <div className="flex justify-center items-end space-x-1 h-12">{generateSoundBars()}</div>

          {/* Status Indicators */}
          <div className="flex justify-center space-x-4">
            <Badge variant={speechDetected ? "default" : "secondary"} className="transition-all duration-200">
              {speechDetected ? "✅ Speech Detected" : "🎤 Listening..."}
            </Badge>
            {maxAudioLevel > 0 && <Badge variant="outline">Max: {(maxAudioLevel * 100).toFixed(1)}%</Badge>}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-4">
          {/* Recording Timer */}
          {(isRecording || recordingTime > 0) && (
            <div className="text-center">
              <span className="text-2xl font-mono font-bold">
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toFixed(1).padStart(4, "0")}
              </span>
            </div>
          )}

          {/* Main Recording Button */}
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
            size="lg"
            className={`w-20 h-20 rounded-full transition-all duration-200 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {hasRecorded && lastRecordingBlob && (
              <Button onClick={playLastRecording} variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Play Recording
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-gray-600 space-y-1">
            <p>
              {isRecording
                ? "Recording... Speak the sentence clearly"
                : hasRecorded
                  ? "Recording complete! You can record again or analyze your pronunciation."
                  : "Click the microphone to start recording"}
            </p>
            {isAnalyzing && <p className="text-blue-600 font-medium">Analyzing your pronunciation...</p>}
          </div>
        </div>

        {/* Debug Information (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded space-y-1">
            <div>RMS Level: {(audioLevel * 100).toFixed(2)}%</div>
            <div>Max Level: {(maxAudioLevel * 100).toFixed(2)}%</div>
            <div>Speech Detected: {speechDetected ? "Yes" : "No"}</div>
            <div>Recording: {isRecording ? "Active" : "Inactive"}</div>
            <div>Time: {recordingTime.toFixed(1)}s</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
