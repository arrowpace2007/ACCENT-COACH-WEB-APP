import { PhonemeAnalysis, WordAnalysis, GOPScore } from '../types'

export class GOPScorer {
  private phonemeModels: Map<string, PhonemeModel> = new Map()
  private initialized = false

  constructor() {
    this.initializePhonemeModels()
  }

  private initializePhonemeModels(): void {
    // Initialize phoneme models with expected acoustic features
    const phonemes = [
      'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'B', 'CH', 'D', 'DH', 'EH', 'ER', 'EY', 'F',
      'G', 'HH', 'IH', 'IY', 'JH', 'K', 'L', 'M', 'N', 'NG', 'OW', 'OY', 'P', 'R',
      'S', 'SH', 'T', 'TH', 'UH', 'UW', 'V', 'W', 'Y', 'Z', 'ZH'
    ]

    phonemes.forEach(phoneme => {
      this.phonemeModels.set(phoneme, this.createPhonemeModel(phoneme))
    })

    this.initialized = true
  }

  private createPhonemeModel(phoneme: string): PhonemeModel {
    // Simplified phoneme model - in production, use trained acoustic models
    const baseFeatures = this.getBasePhonemeFeatures(phoneme)
    
    return {
      phoneme,
      expectedFeatures: baseFeatures,
      variance: this.calculateVariance(baseFeatures),
      duration: this.getExpectedDuration(phoneme),
      formants: this.getExpectedFormants(phoneme)
    }
  }

  private getBasePhonemeFeatures(phoneme: string): number[] {
    // Simplified feature vectors for common phonemes
    const features: { [key: string]: number[] } = {
      'AA': [1.0, 0.8, 0.6, 0.4, 0.2], // Low back vowel
      'AE': [0.9, 0.7, 0.8, 0.5, 0.3], // Low front vowel
      'IY': [0.2, 0.9, 0.8, 0.7, 0.6], // High front vowel
      'UW': [0.1, 0.2, 0.3, 0.8, 0.9], // High back vowel
      'B': [0.8, 0.1, 0.2, 0.1, 0.0],  // Voiced stop
      'P': [0.7, 0.0, 0.1, 0.0, 0.0],  // Voiceless stop
      'S': [0.3, 0.4, 0.8, 0.9, 0.7],  // Voiceless fricative
      'Z': [0.4, 0.5, 0.8, 0.9, 0.8],  // Voiced fricative
    }

    return features[phoneme] || [0.5, 0.5, 0.5, 0.5, 0.5]
  }

  private calculateVariance(features: number[]): number[] {
    // Simplified variance calculation
    return features.map(f => f * 0.1)
  }

  private getExpectedDuration(phoneme: string): number {
    // Expected duration in milliseconds
    const durations: { [key: string]: number } = {
      'AA': 120, 'AE': 110, 'IY': 100, 'UW': 130,
      'B': 80, 'P': 70, 'S': 150, 'Z': 140
    }
    return durations[phoneme] || 100
  }

  private getExpectedFormants(phoneme: string): number[] {
    // Expected formant frequencies (F1, F2, F3)
    const formants: { [key: string]: number[] } = {
      'AA': [730, 1090, 2440],
      'AE': [660, 1720, 2410],
      'IY': [270, 2290, 3010],
      'UW': [300, 870, 2240],
      'B': [0, 0, 0], // Stops don't have clear formants
      'P': [0, 0, 0],
      'S': [0, 0, 0], // Fricatives have noise-like spectra
      'Z': [0, 0, 0]
    }
    return formants[phoneme] || [500, 1500, 2500]
  }

  calculateGOPScore(
    phonemes: PhonemeAnalysis[],
    words: WordAnalysis[],
    audioFeatures: any
  ): GOPScore {
    if (!this.initialized) {
      throw new Error('GOP Scorer not initialized')
    }

    const phonemeScores = this.calculatePhonemeGOP(phonemes, audioFeatures)
    const wordScores = this.calculateWordGOP(words)
    const sentenceScore = this.calculateSentenceGOP(phonemeScores, wordScores)

    const overall = (
      phonemeScores.reduce((sum, score) => sum + score, 0) / phonemeScores.length * 0.4 +
      wordScores.reduce((sum, score) => sum + score, 0) / wordScores.length * 0.4 +
      sentenceScore * 0.2
    )

    const confidence = this.calculateConfidence(phonemeScores, wordScores)

    return {
      overall: Math.round(overall * 100),
      phonemeLevel: phonemeScores.map(score => Math.round(score * 100)),
      wordLevel: wordScores.map(score => Math.round(score * 100)),
      sentenceLevel: Math.round(sentenceScore * 100),
      confidence: Math.round(confidence * 100)
    }
  }

  private calculatePhonemeGOP(phonemes: PhonemeAnalysis[], audioFeatures: any): number[] {
    return phonemes.map(phoneme => {
      const model = this.phonemeModels.get(phoneme.phoneme)
      if (!model) return 0.5

      // Calculate likelihood of observed features given expected phoneme
      const featureScore = this.calculateFeatureLikelihood(phoneme, model, audioFeatures)
      
      // Calculate duration score
      const durationScore = this.calculateDurationScore(phoneme, model)
      
      // Combine scores
      const gopScore = (featureScore * 0.7 + durationScore * 0.3) * phoneme.confidence

      return Math.max(0, Math.min(1, gopScore))
    })
  }

  private calculateFeatureLikelihood(phoneme: PhonemeAnalysis, model: PhonemeModel, audioFeatures: any): number {
    // Simplified feature comparison
    // In production, use proper acoustic model scoring
    
    if (!audioFeatures.mfcc || audioFeatures.mfcc.length === 0) {
      return phoneme.confidence
    }

    // Get MFCC features for this phoneme's time segment
    const startFrame = Math.floor(phoneme.startTime * 100) // Assuming 10ms frames
    const endFrame = Math.floor(phoneme.endTime * 100)
    
    if (startFrame >= audioFeatures.mfcc.length) {
      return phoneme.confidence
    }

    const phonemeMFCC = audioFeatures.mfcc.slice(startFrame, Math.min(endFrame, audioFeatures.mfcc.length))
    
    if (phonemeMFCC.length === 0) {
      return phoneme.confidence
    }

    // Calculate average MFCC for this phoneme
    const avgMFCC = this.calculateAverageMFCC(phonemeMFCC)
    
    // Compare with expected features (simplified)
    const similarity = this.calculateCosineSimilarity(avgMFCC, model.expectedFeatures)
    
    return Math.max(0.1, similarity)
  }

  private calculateAverageMFCC(mfccFrames: number[][]): number[] {
    if (mfccFrames.length === 0) return []
    
    const numCoeffs = mfccFrames[0].length
    const avgMFCC = new Array(numCoeffs).fill(0)
    
    for (const frame of mfccFrames) {
      for (let i = 0; i < numCoeffs && i < frame.length; i++) {
        avgMFCC[i] += frame[i]
      }
    }
    
    return avgMFCC.map(val => val / mfccFrames.length)
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    const minLength = Math.min(vec1.length, vec2.length)
    if (minLength === 0) return 0

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < minLength; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2)
    return magnitude > 0 ? dotProduct / magnitude : 0
  }

  private calculateDurationScore(phoneme: PhonemeAnalysis, model: PhonemeModel): number {
    const actualDuration = (phoneme.endTime - phoneme.startTime) * 1000 // Convert to ms
    const expectedDuration = model.duration
    
    // Calculate duration ratio
    const ratio = actualDuration / expectedDuration
    
    // Score based on how close to expected duration
    if (ratio >= 0.7 && ratio <= 1.3) {
      return 1.0 // Good duration
    } else if (ratio >= 0.5 && ratio <= 1.8) {
      return 0.7 // Acceptable duration
    } else {
      return 0.3 // Poor duration
    }
  }

  private calculateWordGOP(words: WordAnalysis[]): number[] {
    return words.map(word => {
      if (word.phonemes.length === 0) return 0.5

      // Average phoneme scores for the word
      const phonemeAvg = word.phonemes.reduce((sum, p) => sum + p.accuracy, 0) / word.phonemes.length

      // Duration score
      const durationScore = word.expectedDuration > 0 ? 
        Math.min(1, word.duration / word.expectedDuration) : 1

      // Stress score
      const stressScore = Math.max(0, Math.min(1, word.stress))

      // Combine scores
      return (phonemeAvg * 0.6 + durationScore * 0.2 + stressScore * 0.2)
    })
  }

  private calculateSentenceGOP(phonemeScores: number[], wordScores: number[]): number {
    if (phonemeScores.length === 0 && wordScores.length === 0) return 0.5

    const phonemeAvg = phonemeScores.length > 0 ? 
      phonemeScores.reduce((sum, score) => sum + score, 0) / phonemeScores.length : 0.5

    const wordAvg = wordScores.length > 0 ? 
      wordScores.reduce((sum, score) => sum + score, 0) / wordScores.length : 0.5

    // Weight phoneme and word scores
    return phonemeAvg * 0.6 + wordAvg * 0.4
  }

  private calculateConfidence(phonemeScores: number[], wordScores: number[]): number {
    const allScores = [...phonemeScores, ...wordScores]
    if (allScores.length === 0) return 0.5

    // Calculate variance of scores - lower variance = higher confidence
    const mean = allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    const variance = allScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / allScores.length
    
    // Convert variance to confidence (inverse relationship)
    const confidence = Math.max(0.1, 1 - variance)
    
    return confidence
  }
}

interface PhonemeModel {
  phoneme: string
  expectedFeatures: number[]
  variance: number[]
  duration: number
  formants: number[]
}