import { NativeSimilarityScore, AudioFeatures, PhonemeAnalysis } from '../types'

export class NativeSimilarityAnalyzer {
  private nativeReferenceData: Map<string, NativeReference> = new Map()
  private initialized = false

  constructor() {
    this.initializeNativeReferences()
  }

  private initializeNativeReferences(): void {
    // Initialize with reference data for common words/phonemes
    // In production, this would be loaded from trained models
    const commonWords = [
      'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
      'his', 'from', 'they', 'she', 'her', 'been', 'than', 'its', 'who', 'did'
    ]

    commonWords.forEach(word => {
      this.nativeReferenceData.set(word, this.createNativeReference(word))
    })

    this.initialized = true
  }

  private createNativeReference(word: string): NativeReference {
    // Simplified native reference creation
    // In production, use actual native speaker recordings
    return {
      word,
      phonemes: this.getExpectedPhonemes(word),
      prosody: this.getExpectedProsody(word),
      acousticFeatures: this.getExpectedAcousticFeatures(word),
      duration: this.getExpectedDuration(word),
      variance: this.getExpectedVariance(word)
    }
  }

  private getExpectedPhonemes(word: string): string[] {
    // Simplified phoneme mapping
    const phonemeMap: { [key: string]: string[] } = {
      'the': ['DH', 'AH'],
      'and': ['AE', 'N', 'D'],
      'that': ['DH', 'AE', 'T'],
      'have': ['HH', 'AE', 'V'],
      'for': ['F', 'AO', 'R'],
      'not': ['N', 'AA', 'T'],
      'with': ['W', 'IH', 'TH'],
      'you': ['Y', 'UW'],
      'this': ['DH', 'IH', 'S'],
      'but': ['B', 'AH', 'T']
    }
    return phonemeMap[word.toLowerCase()] || []
  }

  private getExpectedProsody(word: string): any {
    // Simplified prosody expectations
    return {
      stress: word.length > 3 ? [1, 0] : [1],
      pitch: [150, 140, 130], // Simplified pitch contour
      energy: [0.8, 0.6, 0.4]
    }
  }

  private getExpectedAcousticFeatures(word: string): number[] {
    // Simplified acoustic feature expectations
    return new Array(13).fill(0).map((_, i) => Math.random() * 2 - 1)
  }

  private getExpectedDuration(word: string): number {
    // Rough duration estimates in seconds
    return word.length * 0.08 + 0.2
  }

  private getExpectedVariance(word: string): number {
    return 0.1 // 10% variance allowed
  }

  calculateNativeSimilarity(
    transcript: string,
    phonemes: PhonemeAnalysis[],
    audioFeatures: AudioFeatures,
    prosody: any
  ): NativeSimilarityScore {
    if (!this.initialized) {
      throw new Error('Native Similarity Analyzer not initialized')
    }

    const words = transcript.toLowerCase().split(/\s+/)
    
    const phoneticScore = this.calculatePhoneticSimilarity(phonemes)
    const prosodicScore = this.calculateProsodicSimilarity(prosody, words)
    const temporalScore = this.calculateTemporalSimilarity(phonemes, words)
    const dtwDistance = this.calculateDTWDistance(audioFeatures, words)

    const overall = (phoneticScore * 0.4 + prosodicScore * 0.3 + temporalScore * 0.3)
    const confidence = this.calculateSimilarityConfidence(phoneticScore, prosodicScore, temporalScore)

    return {
      overall: Math.round(overall * 100),
      phonetic: Math.round(phoneticScore * 100),
      prosodic: Math.round(prosodicScore * 100),
      temporal: Math.round(temporalScore * 100),
      dtwDistance,
      confidence: Math.round(confidence * 100)
    }
  }

  private calculatePhoneticSimilarity(phonemes: PhonemeAnalysis[]): number {
    if (phonemes.length === 0) return 0.5

    let totalSimilarity = 0
    let validPhonemes = 0

    for (const phoneme of phonemes) {
      if (phoneme.expectedPhoneme) {
        // Compare actual vs expected phoneme
        const similarity = phoneme.phoneme === phoneme.expectedPhoneme ? 1.0 : 
                          this.calculatePhonemeDistance(phoneme.phoneme, phoneme.expectedPhoneme)
        
        totalSimilarity += similarity * phoneme.confidence
        validPhonemes++
      } else {
        // Use accuracy as similarity measure
        totalSimilarity += phoneme.accuracy / 100
        validPhonemes++
      }
    }

    return validPhonemes > 0 ? totalSimilarity / validPhonemes : 0.5
  }

  private calculatePhonemeDistance(actual: string, expected: string): number {
    // Simplified phoneme distance calculation
    // In production, use phonetic feature-based distance
    
    if (actual === expected) return 1.0
    
    // Group similar phonemes
    const vowels = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW']
    const stops = ['B', 'D', 'G', 'P', 'T', 'K']
    const fricatives = ['F', 'V', 'TH', 'DH', 'S', 'Z', 'SH', 'ZH', 'HH']
    const nasals = ['M', 'N', 'NG']
    const liquids = ['L', 'R']
    const glides = ['W', 'Y']

    const groups = [vowels, stops, fricatives, nasals, liquids, glides]
    
    for (const group of groups) {
      if (group.includes(actual) && group.includes(expected)) {
        return 0.7 // Similar phoneme class
      }
    }
    
    return 0.3 // Different phoneme class
  }

  private calculateProsodicSimilarity(prosody: any, words: string[]): number {
    if (!prosody) return 0.6

    let totalScore = 0
    let components = 0

    // Stress similarity
    if (prosody.stress) {
      const stressScore = prosody.stress.naturalness || 0.7
      totalScore += stressScore
      components++
    }

    // Rhythm similarity
    if (prosody.rhythm) {
      const rhythmScore = prosody.rhythm.naturalness || 0.7
      totalScore += rhythmScore
      components++
    }

    // Intonation similarity
    if (prosody.intonation) {
      const intonationScore = prosody.intonation.naturalness || 0.7
      totalScore += intonationScore
      components++
    }

    return components > 0 ? totalScore / components : 0.6
  }

  private calculateTemporalSimilarity(phonemes: PhonemeAnalysis[], words: string[]): number {
    if (phonemes.length === 0) return 0.6

    let totalScore = 0
    let validPhonemes = 0

    for (const phoneme of phonemes) {
      const actualDuration = phoneme.endTime - phoneme.startTime
      const expectedDuration = this.getExpectedPhonemeDuration(phoneme.phoneme)
      
      if (expectedDuration > 0) {
        const ratio = actualDuration / expectedDuration
        const score = this.calculateDurationSimilarity(ratio)
        totalScore += score
        validPhonemes++
      }
    }

    return validPhonemes > 0 ? totalScore / validPhonemes : 0.6
  }

  private getExpectedPhonemeDuration(phoneme: string): number {
    // Expected durations in seconds
    const durations: { [key: string]: number } = {
      'AA': 0.12, 'AE': 0.11, 'AH': 0.08, 'AO': 0.13, 'AW': 0.15, 'AY': 0.16,
      'B': 0.08, 'CH': 0.12, 'D': 0.07, 'DH': 0.06, 'EH': 0.10, 'ER': 0.14,
      'EY': 0.15, 'F': 0.11, 'G': 0.08, 'HH': 0.09, 'IH': 0.08, 'IY': 0.10,
      'JH': 0.11, 'K': 0.09, 'L': 0.09, 'M': 0.08, 'N': 0.07, 'NG': 0.09,
      'OW': 0.14, 'OY': 0.16, 'P': 0.08, 'R': 0.10, 'S': 0.12, 'SH': 0.13,
      'T': 0.07, 'TH': 0.09, 'UH': 0.09, 'UW': 0.12, 'V': 0.08, 'W': 0.09,
      'Y': 0.08, 'Z': 0.10, 'ZH': 0.11
    }
    return durations[phoneme] || 0.09
  }

  private calculateDurationSimilarity(ratio: number): number {
    // Optimal ratio is around 1.0
    if (ratio >= 0.8 && ratio <= 1.2) return 1.0
    if (ratio >= 0.6 && ratio <= 1.5) return 0.8
    if (ratio >= 0.4 && ratio <= 2.0) return 0.6
    return 0.3
  }

  private calculateDTWDistance(audioFeatures: AudioFeatures, words: string[]): number {
    // Simplified DTW distance calculation
    // In production, use proper DTW implementation with native reference data
    
    if (!audioFeatures.mfcc || audioFeatures.mfcc.length === 0) {
      return 0.5
    }

    // For now, return a mock DTW distance based on feature variance
    const mfccVariance = this.calculateMFCCVariance(audioFeatures.mfcc)
    
    // Lower variance typically indicates more native-like speech
    return Math.max(0, Math.min(1, mfccVariance * 2))
  }

  private calculateMFCCVariance(mfcc: number[][]): number {
    if (mfcc.length === 0) return 0.5

    const numCoeffs = mfcc[0].length
    let totalVariance = 0

    for (let coeff = 0; coeff < numCoeffs; coeff++) {
      const values = mfcc.map(frame => frame[coeff] || 0)
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      totalVariance += variance
    }

    return totalVariance / numCoeffs
  }

  private calculateSimilarityConfidence(phonetic: number, prosodic: number, temporal: number): number {
    const scores = [phonetic, prosodic, temporal]
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    
    // Higher mean and lower variance = higher confidence
    const meanScore = mean
    const consistencyScore = Math.max(0, 1 - variance * 2)
    
    return (meanScore + consistencyScore) / 2
  }
}

interface NativeReference {
  word: string
  phonemes: string[]
  prosody: any
  acousticFeatures: number[]
  duration: number
  variance: number
}