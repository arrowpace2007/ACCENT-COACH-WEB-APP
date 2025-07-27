"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, Play, Activity, Wifi, WifiOff } from "lucide-react"
import { advancedAudioAnalyzer } from "@/lib/audio/advanced-audio-analyzer"

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  targetSentence: string
  isAnalyzing?: boolean
  enableRealTime?: boolean
}

export default function VoiceRecorder({
  onRecordingComplete,
  targetSentence,
  isAnalyzing = false,
  enableRealTime = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [maxAudioLevel, setMaxAudioLevel] = useState(0)
  const [speechDetected, setSpeechDetected] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [lastRecordingBlob, setLastRecordingBlob] = useState<Blob | null>(null)
  const [realTimeConnected, setRealTimeConnected] = useState(false)
  const [audioQuality, setAudioQuality] = useState({ snr: 0, clarity: 0, stability: 0 })
  const [realTimeResults, setRealTimeResults] = useState<any[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const realTimeAnalyzerRef = useRef<any>(null)

  // Audio analysis constants
  const SILENCE_THRESHOLD = 0.01 // 1%
  const SPEECH_THRESHOLD = 0.05 // 5%
  const STRONG_SPEECH_THRESHOLD = 0.15 // 15%

  // Initialize advanced audio analyzer
  useEffect(() => {
    const initializeAnalyzer = async () => {
      try {
        await advancedAudioAnalyzer.initialize()
        setRealTimeConnected(true)
      } catch (error) {
        console.error('Failed to initialize advanced analyzer:', error)
        setRealTimeConnected(false)
      }
    }

    initializeAnalyzer()
  }, [])

  const startRecording = async () => {
    try {
      console.log("Starting recording...")

      // Reset states
      setAudioLevel(0)
      setMaxAudioLevel(0)
      setSpeechDetected(false)
      setRecordingTime(0)

      // Get user media with optimized settings
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
          latency: 0.01
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      streamRef.current = stream

      // Start real-time analysis if enabled
      if (enableRealTime && realTimeConnected) {
        try {
          await advancedAudioAnalyzer.startRealTimeAnalysis(
            stream,
            targetSentence,
            (result) => {
              setRealTimeResults(prev => [...prev.slice(-10), result]) // Keep last 10 results
            },
            (audioData) => {
              // Update real-time audio metrics
              setAudioLevel(audioData.vad.energy)
              setSpeechDetected(audioData.vad.isActive)
              
              // Update audio quality metrics
              const quality = advancedAudioAnalyzer.getSpeechQualityMetrics()
              setAudioQuality(quality)
            }
          )
        } catch (error) {
          console.error('Real-time analysis failed:', error)
        }
      }

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

    // Stop real-time analysis
    if (enableRealTime) {
      advancedAudioAnalyzer.stopRealTimeAnalysis()
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
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
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (enableRealTime) {
        advancedAudioAnalyzer.stopRealTimeAnalysis()
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
              <span className="flex items-center gap-2">
                Audio Level:
                {enableRealTime && (
                  realTimeConnected ? 
                    <Wifi className="h-4 w-4 text-green-500" /> : 
                    <WifiOff className="h-4 w-4 text-red-500" />
                )}
              </span>
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
            {enableRealTime && (
              <Badge variant={realTimeConnected ? "default" : "destructive"}>
                <Activity className="h-3 w-3 mr-1" />
                {realTimeConnected ? "Real-time" : "Offline"}
              </Badge>
            )}
          </div>

          {/* Audio Quality Metrics */}
          {enableRealTime && realTimeConnected && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold">SNR</div>
                <div className={`${audioQuality.snr > 20 ? 'text-green-600' : audioQuality.snr > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {audioQuality.snr.toFixed(0)}dB
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Clarity</div>
                <div className={`${audioQuality.clarity > 0.8 ? 'text-green-600' : audioQuality.clarity > 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {(audioQuality.clarity * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Stability</div>
                <div className={`${audioQuality.stability > 0.8 ? 'text-green-600' : audioQuality.stability > 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {(audioQuality.stability * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          )}

          {/* Real-time Results */}
          {enableRealTime && realTimeResults.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm font-semibold text-blue-800 mb-2">Real-time Analysis</div>
              <div className="text-xs text-blue-700">
                Latest: {realTimeResults[realTimeResults.length - 1]?.transcript || 'Processing...'}
              </div>
            </div>
          )}
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
                ? enableRealTime 
                  ? "Recording with real-time analysis... Speak clearly"
                  : "Recording... Speak the sentence clearly"
                : hasRecorded
                  ? "Recording complete! You can record again or analyze your pronunciation."
                  : enableRealTime
                    ? "Click to start recording with real-time feedback"
                    : "Click the microphone to start recording"}
            </p>
            {isAnalyzing && <p className="text-blue-600 font-medium">Analyzing your pronunciation...</p>}
            {enableRealTime && !realTimeConnected && (
              <p className="text-orange-600 font-medium">Real-time analysis unavailable - using offline mode</p>
            )}
          </div>
        </div>

        {/* Debug Information (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded space-y-1">
            <div>Audio Level: {(audioLevel * 100).toFixed(2)}%</div>
            <div>Max Level: {(maxAudioLevel * 100).toFixed(2)}%</div>
            <div>Speech Detected: {speechDetected ? "Yes" : "No"}</div>
            <div>Recording: {isRecording ? "Active" : "Inactive"}</div>
            <div>Time: {recordingTime.toFixed(1)}s</div>
            <div>Real-time: {realTimeConnected ? "Connected" : "Disconnected"}</div>
            <div>Quality: SNR={audioQuality.snr.toFixed(1)}, Clarity={audioQuality.clarity.toFixed(2)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
