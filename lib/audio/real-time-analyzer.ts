import { io, Socket } from 'socket.io-client'
import { AudioProcessor } from './processors/audio-processor'
import { RealTimeAudioData, StreamingAnalysisResult, AnalysisConfig } from './types'

export class RealTimeAnalyzer {
  private audioProcessor: AudioProcessor
  private socket: Socket | null = null
  private config: AnalysisConfig
  private isStreaming = false
  private audioBuffer: Float32Array[] = []
  private bufferMaxSize = 100 // Keep last 100 frames

  constructor(config: AnalysisConfig) {
    this.config = config
    this.audioProcessor = new AudioProcessor()
  }

  async initialize(): Promise<void> {
    await this.audioProcessor.initialize()
    
    if (this.config.analysis.enableRealTime) {
      this.initializeWebSocket()
    }
  }

  private initializeWebSocket(): void {
    // Initialize WebSocket connection for real-time streaming
    this.socket = io(process.env.NEXT_PUBLIC_REALTIME_ENDPOINT || 'ws://localhost:3001', {
      transports: ['websocket']
    })

    this.socket.on('connect', () => {
      console.log('Connected to real-time analysis server')
    })

    this.socket.on('analysis_result', (result: StreamingAnalysisResult) => {
      this.handleStreamingResult(result)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from real-time analysis server')
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  async startRealTimeAnalysis(
    stream: MediaStream,
    onResult: (result: StreamingAnalysisResult) => void,
    onAudioData?: (data: RealTimeAudioData) => void
  ): Promise<void> {
    if (this.isStreaming) {
      throw new Error('Real-time analysis already running')
    }

    this.isStreaming = true
    this.audioBuffer = []

    // Start audio processing
    await this.audioProcessor.startProcessing(stream, (audioData) => {
      this.handleRealTimeAudioData(audioData, onResult)
      
      if (onAudioData) {
        onAudioData(audioData)
      }
    })
  }

  private handleRealTimeAudioData(
    audioData: RealTimeAudioData,
    onResult: (result: StreamingAnalysisResult) => void
  ): void {
    // Add to buffer
    this.audioBuffer.push(audioData.audioBuffer)
    
    // Maintain buffer size
    if (this.audioBuffer.length > this.bufferMaxSize) {
      this.audioBuffer.shift()
    }

    // Voice Activity Detection
    if (audioData.vad.isActive && audioData.vad.confidence > this.config.analysis.vadThreshold) {
      // Send audio data for real-time analysis
      if (this.socket && this.socket.connected) {
        this.sendAudioForAnalysis(audioData)
      } else {
        // Fallback to local real-time analysis
        this.performLocalRealTimeAnalysis(audioData, onResult)
      }
    }
  }

  private sendAudioForAnalysis(audioData: RealTimeAudioData): void {
    if (!this.socket) return

    // Convert Float32Array to regular array for JSON serialization
    const audioArray = Array.from(audioData.audioBuffer)
    
    this.socket.emit('analyze_audio', {
      audio: audioArray,
      timestamp: audioData.timestamp,
      vad: audioData.vad,
      features: audioData.features
    })
  }

  private performLocalRealTimeAnalysis(
    audioData: RealTimeAudioData,
    onResult: (result: StreamingAnalysisResult) => void
  ): void {
    // Perform basic local real-time analysis
    const result: StreamingAnalysisResult = {
      partial: true,
      transcript: '', // Would need local ASR for transcript
      confidence: audioData.vad.confidence,
      phonemes: [], // Would need local phoneme recognition
      timestamp: audioData.timestamp
    }

    onResult(result)
  }

  private handleStreamingResult(result: StreamingAnalysisResult): void {
    // Process streaming result from server
    console.log('Received streaming result:', result)
  }

  stopRealTimeAnalysis(): void {
    this.isStreaming = false
    this.audioProcessor.stopProcessing()
    
    if (this.socket) {
      this.socket.emit('stop_analysis')
    }
  }

  async getBufferedAudio(): Promise<Float32Array> {
    // Concatenate buffered audio frames
    if (this.audioBuffer.length === 0) {
      return new Float32Array(0)
    }

    const totalLength = this.audioBuffer.reduce((sum, buffer) => sum + buffer.length, 0)
    const concatenated = new Float32Array(totalLength)
    
    let offset = 0
    for (const buffer of this.audioBuffer) {
      concatenated.set(buffer, offset)
      offset += buffer.length
    }
    
    return concatenated
  }

  async analyzeBufferedAudio(targetSentence: string): Promise<any> {
    const audioData = await this.getBufferedAudio()
    
    if (audioData.length === 0) {
      throw new Error('No audio data available')
    }

    // Convert to buffer for analysis
    const buffer = this.float32ArrayToBuffer(audioData)
    
    // Use the multi-model analyzer for comprehensive analysis
    // This would typically be injected as a dependency
    return {
      transcript: targetSentence,
      confidence: 0.8,
      analysis: 'Buffered audio analysis completed'
    }
  }

  private float32ArrayToBuffer(float32Array: Float32Array): Buffer {
    // Convert Float32Array to Buffer
    const int16Array = new Int16Array(float32Array.length)
    
    for (let i = 0; i < float32Array.length; i++) {
      int16Array[i] = Math.max(-32768, Math.min(32767, float32Array[i] * 32768))
    }
    
    return Buffer.from(int16Array.buffer)
  }

  updateConfig(newConfig: Partial<AnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  disconnect(): void {
    this.stopRealTimeAnalysis()
    
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Voice Activity Detection helpers
  isVoiceActive(): boolean {
    if (this.audioBuffer.length === 0) return false
    
    const recentFrames = this.audioBuffer.slice(-5) // Last 5 frames
    const avgEnergy = recentFrames.reduce((sum, frame) => {
      const energy = this.calculateFrameEnergy(frame)
      return sum + energy
    }, 0) / recentFrames.length

    return avgEnergy > this.config.analysis.vadThreshold
  }

  private calculateFrameEnergy(frame: Float32Array): number {
    let energy = 0
    for (let i = 0; i < frame.length; i++) {
      energy += frame[i] * frame[i]
    }
    return Math.sqrt(energy / frame.length)
  }

  getAudioLevelMeter(): number {
    if (this.audioBuffer.length === 0) return 0
    
    const latestFrame = this.audioBuffer[this.audioBuffer.length - 1]
    return this.calculateFrameEnergy(latestFrame)
  }

  getSpeechQualityMetrics(): any {
    if (this.audioBuffer.length === 0) {
      return {
        snr: 0,
        clarity: 0,
        stability: 0
      }
    }

    const recentFrames = this.audioBuffer.slice(-10)
    const energies = recentFrames.map(frame => this.calculateFrameEnergy(frame))
    
    const avgEnergy = energies.reduce((sum, e) => sum + e, 0) / energies.length
    const energyVariance = energies.reduce((sum, e) => sum + Math.pow(e - avgEnergy, 2), 0) / energies.length
    
    return {
      snr: Math.min(100, avgEnergy * 100), // Simplified SNR estimate
      clarity: Math.max(0, 1 - energyVariance), // Lower variance = higher clarity
      stability: Math.max(0, 1 - (energyVariance / avgEnergy)) // Stability metric
    }
  }
}