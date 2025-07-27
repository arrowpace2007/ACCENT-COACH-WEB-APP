export interface AudioFeatures {
  mfcc: number[][]
  spectralCentroid: number[]
  spectralRolloff: number[]
  zeroCrossingRate: number[]
  energy: number[]
  pitch: number[]
  formants: number[][]
}

export interface PhonemeAnalysis {
  phoneme: string
  startTime: number
  endTime: number
  confidence: number
  accuracy: number
  expectedPhoneme?: string
  issues?: string[]
}

export interface WordAnalysis {
  word: string
  startTime: number
  endTime: number
  phonemes: PhonemeAnalysis[]
  accuracy: number
  stress: number
  duration: number
  expectedDuration: number
  issues?: string[]
}

export interface ProsodyAnalysis {
  stress: {
    pattern: number[]
    accuracy: number
    naturalness: number
  }
  rhythm: {
    timing: number[]
    regularity: number
    naturalness: number
  }
  intonation: {
    contour: number[]
    range: number
    naturalness: number
  }
  pace: {
    wordsPerMinute: number
    pausePattern: number[]
    fluency: number
  }
}

export interface GOPScore {
  overall: number
  phonemeLevel: number[]
  wordLevel: number[]
  sentenceLevel: number
  confidence: number
}

export interface NativeSimilarityScore {
  overall: number
  phonetic: number
  prosodic: number
  temporal: number
  dtwDistance: number
  confidence: number
}

export interface AudioQualityMetrics {
  snr: number // Signal-to-noise ratio
  clarity: number
  volume: number
  backgroundNoise: number
  echoCancellation: number
  distortion: number
  sampleRate: number
  bitDepth: number
  duration: number
}

export interface AdvancedPronunciationAnalysis {
  overallScore: number
  gopScore: GOPScore
  nativeSimilarity: NativeSimilarityScore
  prosody: ProsodyAnalysis
  words: WordAnalysis[]
  audioFeatures: AudioFeatures
  audioQuality: AudioQualityMetrics
  feedback: {
    overall: string
    strengths: string[]
    improvements: string[]
    specificTips: string[]
    nextSteps: string[]
  }
  confidence: number
  processingTime: number
  modelUsed: string[]
  timestamp: string
}

export interface VoiceActivityDetection {
  isActive: boolean
  confidence: number
  energy: number
  spectralEntropy: number
  zeroCrossingRate: number
}

export interface RealTimeAudioData {
  audioBuffer: Float32Array
  timestamp: number
  vad: VoiceActivityDetection
  features: Partial<AudioFeatures>
}

export interface StreamingAnalysisResult {
  partial: boolean
  transcript: string
  confidence: number
  phonemes: PhonemeAnalysis[]
  timestamp: number
}

export interface ModelConfig {
  name: string
  endpoint?: string
  apiKey?: string
  enabled: boolean
  priority: number
  timeout: number
  retryAttempts: number
}

export interface AnalysisConfig {
  models: {
    google: ModelConfig
    azure: ModelConfig
    gemini: ModelConfig
    local: ModelConfig
  }
  audio: {
    sampleRate: number
    channels: number
    bitDepth: number
    bufferSize: number
    enableNoiseReduction: boolean
    enableEchoCancellation: boolean
    enableAutoGainControl: boolean
  }
  analysis: {
    enableRealTime: boolean
    enableGOP: boolean
    enableProsody: boolean
    enableNativeSimilarity: boolean
    confidenceThreshold: number
    vadThreshold: number
  }
}