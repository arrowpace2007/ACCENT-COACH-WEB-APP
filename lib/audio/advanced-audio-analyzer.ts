import { MultiModelAnalyzer } from './services/multi-model-analyzer'
import { RealTimeAnalyzer } from './real-time-analyzer'
import { AdvancedPronunciationAnalysis, AnalysisConfig } from './types'

export class AdvancedAudioAnalyzer {
  private multiModelAnalyzer: MultiModelAnalyzer
  private realTimeAnalyzer: RealTimeAnalyzer
  private config: AnalysisConfig

  constructor() {
    this.config = this.getDefaultConfig()
    this.multiModelAnalyzer = new MultiModelAnalyzer(this.config)
    this.realTimeAnalyzer = new RealTimeAnalyzer(this.config)
  }

  private getDefaultConfig(): AnalysisConfig {
    return {
      models: {
        google: {
          name: 'Google Cloud Speech',
          apiKey: process.env.GOOGLE_CLOUD_API_KEY,
          enabled: !!process.env.GOOGLE_CLOUD_API_KEY,
          priority: 3,
          timeout: 10000,
          retryAttempts: 2
        },
        azure: {
          name: 'Azure Speech',
          apiKey: process.env.AZURE_SPEECH_KEY,
          enabled: !!process.env.AZURE_SPEECH_KEY,
          priority: 2,
          timeout: 10000,
          retryAttempts: 2
        },
        gemini: {
          name: 'Gemini Pro',
          apiKey: process.env.GEMINI_API_KEY,
          enabled: !!process.env.GEMINI_API_KEY,
          priority: 1,
          timeout: 15000,
          retryAttempts: 1
        },
        local: {
          name: 'Local Analysis',
          enabled: true,
          priority: 0,
          timeout: 5000,
          retryAttempts: 1
        }
      },
      audio: {
        sampleRate: 44100,
        channels: 1,
        bitDepth: 16,
        bufferSize: 4096,
        enableNoiseReduction: true,
        enableEchoCancellation: true,
        enableAutoGainControl: true
      },
      analysis: {
        enableRealTime: true,
        enableGOP: true,
        enableProsody: true,
        enableNativeSimilarity: true,
        confidenceThreshold: 0.7,
        vadThreshold: 0.01
      }
    }
  }

  async initialize(): Promise<void> {
    await this.realTimeAnalyzer.initialize()
  }

  async analyzeAudio(
    audioBuffer: Buffer,
    targetSentence: string,
    options?: {
      userAccent?: string
      enableRealTime?: boolean
      modelPreference?: string[]
    }
  ): Promise<AdvancedPronunciationAnalysis> {
    try {
      // Validate input
      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Invalid audio buffer')
      }

      if (!targetSentence || targetSentence.trim().length === 0) {
        throw new Error('Target sentence is required')
      }

      // Update config based on options
      if (options?.modelPreference) {
        this.updateModelPriorities(options.modelPreference)
      }

      // Perform multi-model analysis
      const result = await this.multiModelAnalyzer.analyzeAudio(
        audioBuffer,
        targetSentence,
        options?.userAccent
      )

      // Validate result
      this.validateAnalysisResult(result)

      return result

    } catch (error) {
      console.error('Advanced audio analysis failed:', error)
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async startRealTimeAnalysis(
    stream: MediaStream,
    targetSentence: string,
    onResult: (result: any) => void,
    onAudioData?: (data: any) => void
  ): Promise<void> {
    if (!this.config.analysis.enableRealTime) {
      throw new Error('Real-time analysis is disabled')
    }

    await this.realTimeAnalyzer.startRealTimeAnalysis(
      stream,
      onResult,
      onAudioData
    )
  }

  stopRealTimeAnalysis(): void {
    this.realTimeAnalyzer.stopRealTimeAnalysis()
  }

  async getSystemHealth(): Promise<{
    overall: boolean
    models: { [key: string]: boolean }
    realTime: boolean
  }> {
    const modelHealth = await this.multiModelAnalyzer.getModelHealth()
    const realTimeHealth = this.realTimeAnalyzer.isVoiceActive !== undefined

    const overall = Object.values(modelHealth).some(healthy => healthy) && realTimeHealth

    return {
      overall,
      models: modelHealth,
      realTime: realTimeHealth
    }
  }

  updateConfiguration(newConfig: Partial<AnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.multiModelAnalyzer.updateConfig(newConfig)
    this.realTimeAnalyzer.updateConfig(newConfig)
  }

  private updateModelPriorities(modelPreference: string[]): void {
    modelPreference.forEach((modelName, index) => {
      if (this.config.models[modelName as keyof typeof this.config.models]) {
        this.config.models[modelName as keyof typeof this.config.models].priority = modelPreference.length - index
      }
    })
  }

  private validateAnalysisResult(result: AdvancedPronunciationAnalysis): void {
    if (!result) {
      throw new Error('Analysis result is null or undefined')
    }

    if (typeof result.overallScore !== 'number' || result.overallScore < 0 || result.overallScore > 100) {
      throw new Error('Invalid overall score')
    }

    if (!result.feedback || !result.feedback.overall) {
      throw new Error('Missing feedback in analysis result')
    }

    if (!Array.isArray(result.words)) {
      throw new Error('Invalid words analysis')
    }

    if (result.confidence < 0 || result.confidence > 100) {
      throw new Error('Invalid confidence score')
    }
  }

  // Utility methods for audio processing
  async validateAudioQuality(audioBuffer: Buffer): Promise<{
    isValid: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues = []
    const recommendations = []

    // Check audio length
    if (audioBuffer.length < 1000) {
      issues.push('Audio too short')
      recommendations.push('Record for at least 2-3 seconds')
    }

    if (audioBuffer.length > 10000000) { // ~10MB
      issues.push('Audio file too large')
      recommendations.push('Keep recordings under 30 seconds')
    }

    // Convert to Float32Array for analysis
    const audioFloat32 = this.bufferToFloat32Array(audioBuffer)
    const audioQuality = await this.realTimeAnalyzer['audioProcessor'].getAudioQualityMetrics(audioFloat32)

    // Check signal quality
    if (audioQuality.volume && audioQuality.volume < 0.1) {
      issues.push('Audio level too low')
      recommendations.push('Speak louder or move closer to microphone')
    }

    if (audioQuality.backgroundNoise && audioQuality.backgroundNoise > 0.3) {
      issues.push('High background noise')
      recommendations.push('Record in a quieter environment')
    }

    if (audioQuality.clarity && audioQuality.clarity < 0.6) {
      issues.push('Poor audio clarity')
      recommendations.push('Check microphone quality and positioning')
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    }
  }

  private bufferToFloat32Array(buffer: Buffer): Float32Array {
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    const int16Array = new Int16Array(arrayBuffer)
    const float32Array = new Float32Array(int16Array.length)
    
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0
    }
    
    return float32Array
  }

  // Performance monitoring
  getPerformanceMetrics(): {
    averageProcessingTime: number
    successRate: number
    modelUsageStats: { [key: string]: number }
  } {
    // This would be implemented with actual metrics collection
    return {
      averageProcessingTime: 2500, // ms
      successRate: 0.95,
      modelUsageStats: {
        google: 0.4,
        azure: 0.3,
        gemini: 0.2,
        local: 0.1
      }
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.realTimeAnalyzer.disconnect()
    // Additional cleanup as needed
  }
}

// Export singleton instance
export const advancedAudioAnalyzer = new AdvancedAudioAnalyzer()