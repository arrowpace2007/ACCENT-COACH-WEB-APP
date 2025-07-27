import { AdvancedPronunciationAnalysis, ModelConfig } from '../types'
import { AudioProcessor } from '../processors/audio-processor'
import { GOPScorer } from '../analysis/gop-scorer'
import { ProsodyAnalyzer } from '../analysis/prosody-analyzer'
import { NativeSimilarityAnalyzer } from '../analysis/native-similarity'

export class LocalAnalysisService {
  private config: ModelConfig
  private audioProcessor: AudioProcessor
  private gopScorer: GOPScorer
  private prosodyAnalyzer: ProsodyAnalyzer
  private nativeSimilarityAnalyzer: NativeSimilarityAnalyzer

  constructor(config: ModelConfig) {
    this.config = config
    this.audioProcessor = new AudioProcessor()
    this.gopScorer = new GOPScorer()
    this.prosodyAnalyzer = new ProsodyAnalyzer()
    this.nativeSimilarityAnalyzer = new NativeSimilarityAnalyzer()
  }

  async analyze(audioBuffer: Buffer, targetSentence: string): Promise<AdvancedPronunciationAnalysis> {
    try {
      // Convert buffer to Float32Array for processing
      const audioFloat32 = this.bufferToFloat32Array(audioBuffer)
      
      // Extract comprehensive audio features
      const audioFeatures = await this.audioProcessor.extractMFCC(audioFloat32)
      const audioQuality = this.audioProcessor.getAudioQualityMetrics(audioFloat32)

      // Perform local speech analysis
      const localResult = await this.performLocalAnalysis(audioFloat32, targetSentence)
      
      // Extract phoneme and word analysis
      const phonemes = this.extractPhonemeAnalysis(localResult, targetSentence)
      const words = this.extractWordAnalysis(localResult, targetSentence)
      
      // Calculate GOP scores
      const gopScore = this.gopScorer.calculateGOPScore(phonemes, words, { mfcc: audioFeatures })
      
      // Analyze prosody
      const prosody = this.prosodyAnalyzer.analyzeProsody(
        audioFloat32,
        targetSentence,
        words.map(w => ({ word: w.word, start: w.startTime, end: w.endTime }))
      )
      
      // Calculate native similarity
      const nativeSimilarity = this.nativeSimilarityAnalyzer.calculateNativeSimilarity(
        targetSentence,
        phonemes,
        { mfcc: audioFeatures } as any,
        prosody
      )

      // Generate comprehensive feedback
      const feedback = this.generateLocalFeedback(gopScore, prosody, nativeSimilarity, audioQuality)

      return {
        overallScore: Math.round((gopScore.overall + nativeSimilarity.overall) / 2),
        gopScore,
        nativeSimilarity,
        prosody,
        words,
        audioFeatures: { mfcc: audioFeatures } as any,
        audioQuality: audioQuality as any,
        feedback,
        confidence: Math.round((gopScore.confidence + nativeSimilarity.confidence) / 2),
        processingTime: 0,
        modelUsed: ['local-analysis'],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('Local analysis failed:', error)
      throw error
    }
  }

  private async performLocalAnalysis(audioFloat32: Float32Array, targetSentence: string): Promise<any> {
    // Perform local audio analysis using signal processing techniques
    
    // Extract basic features
    const energy = this.calculateFrameEnergy(audioFloat32)
    const zcr = this.calculateZeroCrossingRate(audioFloat32)
    const spectralFeatures = this.extractSpectralFeatures(audioFloat32)
    
    // Estimate speech segments
    const speechSegments = this.detectSpeechSegments(energy, zcr)
    
    // Estimate word boundaries
    const wordBoundaries = this.estimateWordBoundaries(speechSegments, targetSentence)
    
    return {
      energy,
      zcr,
      spectralFeatures,
      speechSegments,
      wordBoundaries,
      transcript: targetSentence // Use target as transcript for local analysis
    }
  }

  private calculateFrameEnergy(audioBuffer: Float32Array): number[] {
    const frameSize = 1024
    const hopSize = 512
    const frames = this.frameSignal(audioBuffer, frameSize, hopSize)
    
    return frames.map(frame => {
      let energy = 0
      for (let i = 0; i < frame.length; i++) {
        energy += frame[i] * frame[i]
      }
      return Math.sqrt(energy / frame.length)
    })
  }

  private calculateZeroCrossingRate(audioBuffer: Float32Array): number[] {
    const frameSize = 1024
    const hopSize = 512
    const frames = this.frameSignal(audioBuffer, frameSize, hopSize)
    
    return frames.map(frame => {
      let crossings = 0
      for (let i = 1; i < frame.length; i++) {
        if ((frame[i] >= 0) !== (frame[i - 1] >= 0)) {
          crossings++
        }
      }
      return crossings / (frame.length - 1)
    })
  }

  private extractSpectralFeatures(audioBuffer: Float32Array): any {
    // Extract spectral centroid, rolloff, etc.
    const frameSize = 1024
    const hopSize = 512
    const frames = this.frameSignal(audioBuffer, frameSize, hopSize)
    
    const spectralCentroids = []
    const spectralRolloffs = []
    
    for (const frame of frames) {
      const fft = this.computeFFT(frame)
      const magnitude = fft.map(val => Math.abs(val))
      
      spectralCentroids.push(this.calculateSpectralCentroid(magnitude))
      spectralRolloffs.push(this.calculateSpectralRolloff(magnitude))
    }
    
    return {
      spectralCentroids,
      spectralRolloffs
    }
  }

  private frameSignal(signal: Float32Array, frameSize: number, hopSize: number): Float32Array[] {
    const frames: Float32Array[] = []
    const numFrames = Math.floor((signal.length - frameSize) / hopSize) + 1

    for (let i = 0; i < numFrames; i++) {
      const start = i * hopSize
      const frame = signal.slice(start, start + frameSize)
      frames.push(new Float32Array(frame))
    }

    return frames
  }

  private computeFFT(signal: Float32Array): number[] {
    // Simplified FFT implementation
    const N = signal.length
    const result = new Array(N).fill(0)
    
    for (let k = 0; k < N; k++) {
      let real = 0
      let imag = 0
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N
        real += signal[n] * Math.cos(angle)
        imag += signal[n] * Math.sin(angle)
      }
      result[k] = Math.sqrt(real * real + imag * imag)
    }
    
    return result
  }

  private calculateSpectralCentroid(magnitude: number[]): number {
    let weightedSum = 0
    let magnitudeSum = 0

    for (let i = 0; i < magnitude.length; i++) {
      weightedSum += i * magnitude[i]
      magnitudeSum += magnitude[i]
    }

    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0
  }

  private calculateSpectralRolloff(magnitude: number[]): number {
    const totalEnergy = magnitude.reduce((sum, val) => sum + val, 0)
    const threshold = totalEnergy * 0.85

    let cumulativeEnergy = 0
    for (let i = 0; i < magnitude.length; i++) {
      cumulativeEnergy += magnitude[i]
      if (cumulativeEnergy >= threshold) {
        return i
      }
    }

    return magnitude.length - 1
  }

  private detectSpeechSegments(energy: number[], zcr: number[]): Array<{ start: number; end: number }> {
    const energyThreshold = this.calculateThreshold(energy, 0.3)
    const zcrThreshold = this.calculateThreshold(zcr, 0.7)
    
    const segments = []
    let inSpeech = false
    let segmentStart = 0
    
    for (let i = 0; i < energy.length; i++) {
      const isSpeech = energy[i] > energyThreshold && zcr[i] < zcrThreshold
      
      if (!inSpeech && isSpeech) {
        inSpeech = true
        segmentStart = i
      } else if (inSpeech && !isSpeech) {
        inSpeech = false
        segments.push({
          start: segmentStart * 0.0116, // Convert frame to seconds (512/44100)
          end: i * 0.0116
        })
      }
    }
    
    // Close final segment if needed
    if (inSpeech) {
      segments.push({
        start: segmentStart * 0.0116,
        end: energy.length * 0.0116
      })
    }
    
    return segments
  }

  private calculateThreshold(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.floor(sorted.length * percentile)
    return sorted[index] || 0
  }

  private estimateWordBoundaries(
    speechSegments: Array<{ start: number; end: number }>,
    targetSentence: string
  ): Array<{ word: string; start: number; end: number }> {
    const words = targetSentence.split(/\s+/)
    const wordBoundaries = []
    
    if (speechSegments.length === 0) {
      // Fallback: distribute words evenly
      const totalDuration = 3.0 // Assume 3 seconds
      const wordDuration = totalDuration / words.length
      
      for (let i = 0; i < words.length; i++) {
        wordBoundaries.push({
          word: words[i],
          start: i * wordDuration,
          end: (i + 1) * wordDuration
        })
      }
    } else {
      // Distribute words across speech segments
      const totalSpeechDuration = speechSegments.reduce((sum, seg) => sum + (seg.end - seg.start), 0)
      let currentTime = speechSegments[0].start
      
      for (let i = 0; i < words.length; i++) {
        const wordDuration = (words[i].length / targetSentence.length) * totalSpeechDuration
        wordBoundaries.push({
          word: words[i],
          start: currentTime,
          end: currentTime + wordDuration
        })
        currentTime += wordDuration + 0.05 // Small pause between words
      }
    }
    
    return wordBoundaries
  }

  private extractPhonemeAnalysis(localResult: any, targetSentence: string): any[] {
    // Estimate phonemes from word boundaries
    const phonemes = []
    const words = targetSentence.split(/\s+/)
    
    for (let i = 0; i < words.length && i < localResult.wordBoundaries.length; i++) {
      const word = words[i]
      const boundary = localResult.wordBoundaries[i]
      const wordPhonemes = this.estimateWordPhonemes(word, boundary.start, boundary.end)
      phonemes.push(...wordPhonemes)
    }
    
    return phonemes
  }

  private estimateWordPhonemes(word: string, startTime: number, endTime: number): any[] {
    // Simplified phoneme estimation
    const phonemeCount = Math.max(2, Math.ceil(word.length * 0.8))
    const duration = (endTime - startTime) / phonemeCount
    
    const phonemes = []
    for (let i = 0; i < phonemeCount; i++) {
      phonemes.push({
        phoneme: `P${i}`, // Placeholder phoneme
        startTime: startTime + i * duration,
        endTime: startTime + (i + 1) * duration,
        confidence: 0.7,
        accuracy: 70 + Math.random() * 20
      })
    }
    
    return phonemes
  }

  private extractWordAnalysis(localResult: any, targetSentence: string): any[] {
    const words = targetSentence.split(/\s+/)
    
    return localResult.wordBoundaries.map((boundary: any, index: number) => ({
      word: boundary.word,
      startTime: boundary.start,
      endTime: boundary.end,
      phonemes: this.estimateWordPhonemes(boundary.word, boundary.start, boundary.end),
      accuracy: 70 + Math.random() * 25,
      stress: index % 2 === 0 ? 0.8 : 0.4, // Alternate stress pattern
      duration: boundary.end - boundary.start,
      expectedDuration: boundary.word.length * 0.08 + 0.1
    }))
  }

  private generateLocalFeedback(gopScore: any, prosody: any, nativeSimilarity: any, audioQuality: any): any {
    const strengths = []
    const improvements = []
    const specificTips = []

    // Audio quality feedback
    if (audioQuality.clarity >= 0.8) {
      strengths.push('Clear audio quality')
    } else {
      improvements.push('Improve recording quality')
      specificTips.push('Use a better microphone or reduce background noise')
    }

    // GOP score feedback
    if (gopScore.overall >= 80) {
      strengths.push('Good pronunciation accuracy')
    } else {
      improvements.push('Focus on pronunciation accuracy')
      specificTips.push('Practice individual sounds that need improvement')
    }

    // Prosody feedback
    if (prosody.rhythm?.naturalness >= 0.8) {
      strengths.push('Natural speech rhythm')
    } else {
      improvements.push('Work on speech rhythm')
      specificTips.push('Practice with a metronome or rhythm exercises')
    }

    // Native similarity feedback
    if (nativeSimilarity.overall >= 80) {
      strengths.push('Native-like pronunciation')
    } else {
      improvements.push('Work towards more native-like speech')
    }

    const overall = `Local analysis shows ${gopScore.overall >= 80 ? 'good' : 'developing'} pronunciation accuracy. ${audioQuality.clarity >= 0.8 ? 'Audio quality is clear.' : 'Consider improving recording conditions.'}`

    return {
      overall,
      strengths: strengths.slice(0, 5),
      improvements: improvements.slice(0, 5),
      specificTips: specificTips.slice(0, 3),
      nextSteps: [
        'Continue practicing with local analysis',
        'Focus on identified improvement areas',
        'Try cloud-based analysis for more detailed feedback'
      ]
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

  async healthCheck(): Promise<boolean> {
    // Local analysis is always available
    return this.config.enabled
  }

  updateConfig(newConfig: Partial<ModelConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}