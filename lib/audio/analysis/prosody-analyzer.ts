import { ProsodyAnalysis, AudioFeatures } from '../types'

export class ProsodyAnalyzer {
  private readonly FRAME_SIZE = 1024
  private readonly HOP_SIZE = 512
  private readonly SAMPLE_RATE = 44100

  analyzeProsody(
    audioBuffer: Float32Array,
    transcript: string,
    wordTimings: Array<{ word: string; start: number; end: number }>
  ): ProsodyAnalysis {
    const pitch = this.extractPitch(audioBuffer)
    const energy = this.extractEnergy(audioBuffer)
    const duration = audioBuffer.length / this.SAMPLE_RATE

    const stress = this.analyzeStress(pitch, energy, wordTimings)
    const rhythm = this.analyzeRhythm(wordTimings, duration)
    const intonation = this.analyzeIntonation(pitch, transcript)
    const pace = this.analyzePace(wordTimings, transcript, duration)

    return {
      stress,
      rhythm,
      intonation,
      pace
    }
  }

  private extractPitch(audioBuffer: Float32Array): number[] {
    const frames = this.frameSignal(audioBuffer)
    return frames.map(frame => this.estimatePitch(frame))
  }

  private extractEnergy(audioBuffer: Float32Array): number[] {
    const frames = this.frameSignal(audioBuffer)
    return frames.map(frame => {
      let energy = 0
      for (let i = 0; i < frame.length; i++) {
        energy += frame[i] * frame[i]
      }
      return Math.sqrt(energy / frame.length)
    })
  }

  private frameSignal(signal: Float32Array): Float32Array[] {
    const frames: Float32Array[] = []
    const numFrames = Math.floor((signal.length - this.FRAME_SIZE) / this.HOP_SIZE) + 1

    for (let i = 0; i < numFrames; i++) {
      const start = i * this.HOP_SIZE
      const frame = signal.slice(start, start + this.FRAME_SIZE)
      frames.push(new Float32Array(frame))
    }

    return frames
  }

  private estimatePitch(frame: Float32Array): number {
    // Simplified pitch estimation using autocorrelation
    const minPeriod = Math.floor(this.SAMPLE_RATE / 500) // 500 Hz max
    const maxPeriod = Math.floor(this.SAMPLE_RATE / 50)  // 50 Hz min

    let maxCorrelation = 0
    let bestPeriod = 0

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0
      let count = 0

      for (let i = 0; i < frame.length - period; i++) {
        correlation += frame[i] * frame[i + period]
        count++
      }

      if (count > 0) {
        correlation /= count
        if (correlation > maxCorrelation) {
          maxCorrelation = correlation
          bestPeriod = period
        }
      }
    }

    return bestPeriod > 0 ? this.SAMPLE_RATE / bestPeriod : 0
  }

  private analyzeStress(
    pitch: number[],
    energy: number[],
    wordTimings: Array<{ word: string; start: number; end: number }>
  ): { pattern: number[]; accuracy: number; naturalness: number } {
    const stressPattern = wordTimings.map(word => {
      const startFrame = Math.floor(word.start * this.SAMPLE_RATE / this.HOP_SIZE)
      const endFrame = Math.floor(word.end * this.SAMPLE_RATE / this.HOP_SIZE)
      
      const wordPitch = pitch.slice(startFrame, endFrame)
      const wordEnergy = energy.slice(startFrame, endFrame)
      
      if (wordPitch.length === 0 || wordEnergy.length === 0) return 0.5

      // Calculate stress based on pitch and energy
      const avgPitch = wordPitch.reduce((sum, p) => sum + p, 0) / wordPitch.length
      const avgEnergy = wordEnergy.reduce((sum, e) => sum + e, 0) / wordEnergy.length
      
      // Normalize and combine
      const normalizedPitch = Math.min(1, avgPitch / 200) // Normalize to 200 Hz
      const normalizedEnergy = Math.min(1, avgEnergy * 10) // Scale energy
      
      return (normalizedPitch + normalizedEnergy) / 2
    })

    const expectedPattern = this.getExpectedStressPattern(wordTimings.map(w => w.word))
    const accuracy = this.calculateStressAccuracy(stressPattern, expectedPattern)
    const naturalness = this.calculateStressNaturalness(stressPattern)

    return {
      pattern: stressPattern,
      accuracy,
      naturalness
    }
  }

  private getExpectedStressPattern(words: string[]): number[] {
    // Simplified stress pattern prediction
    return words.map(word => {
      // Basic heuristics for English stress patterns
      if (word.length <= 2) return 0.8 // Short words usually stressed
      if (word.endsWith('ing') || word.endsWith('ed')) return 0.3 // Suffixes usually unstressed
      if (word.startsWith('un') || word.startsWith('re')) return 0.6 // Prefixes vary
      
      // Default: stress on first syllable for content words
      return 0.7
    })
  }

  private calculateStressAccuracy(actual: number[], expected: number[]): number {
    if (actual.length !== expected.length) return 0.5

    let totalError = 0
    for (let i = 0; i < actual.length; i++) {
      totalError += Math.abs(actual[i] - expected[i])
    }

    const avgError = totalError / actual.length
    return Math.max(0, 1 - avgError)
  }

  private calculateStressNaturalness(pattern: number[]): number {
    if (pattern.length < 2) return 0.8

    // Check for natural stress variation
    const variance = this.calculateVariance(pattern)
    const range = Math.max(...pattern) - Math.min(...pattern)
    
    // Natural speech has moderate variance and range
    const varianceScore = variance > 0.05 && variance < 0.3 ? 1 : 0.6
    const rangeScore = range > 0.2 && range < 0.8 ? 1 : 0.7
    
    return (varianceScore + rangeScore) / 2
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
  }

  private analyzeRhythm(
    wordTimings: Array<{ word: string; start: number; end: number }>,
    totalDuration: number
  ): { timing: number[]; regularity: number; naturalness: number } {
    const intervals = []
    for (let i = 1; i < wordTimings.length; i++) {
      const interval = wordTimings[i].start - wordTimings[i - 1].end
      intervals.push(interval)
    }

    const regularity = this.calculateRhythmRegularity(intervals)
    const naturalness = this.calculateRhythmNaturalness(intervals, wordTimings)

    return {
      timing: intervals,
      regularity,
      naturalness
    }
  }

  private calculateRhythmRegularity(intervals: number[]): number {
    if (intervals.length < 2) return 0.8

    const variance = this.calculateVariance(intervals)
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length
    
    // Coefficient of variation
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 1
    
    // Lower CV indicates more regular rhythm
    return Math.max(0, 1 - cv)
  }

  private calculateRhythmNaturalness(
    intervals: number[],
    wordTimings: Array<{ word: string; start: number; end: number }>
  ): number {
    // Natural speech has pauses at appropriate places
    let appropriatePauses = 0
    let totalPauses = 0

    for (let i = 0; i < intervals.length; i++) {
      if (intervals[i] > 0.1) { // Pause longer than 100ms
        totalPauses++
        
        const currentWord = wordTimings[i].word
        const nextWord = wordTimings[i + 1].word
        
        // Check if pause is at natural boundary
        if (this.isNaturalPauseBoundary(currentWord, nextWord)) {
          appropriatePauses++
        }
      }
    }

    return totalPauses > 0 ? appropriatePauses / totalPauses : 0.8
  }

  private isNaturalPauseBoundary(currentWord: string, nextWord: string): boolean {
    // Simplified natural pause detection
    const punctuationWords = ['.', ',', '!', '?', ';', ':']
    const conjunctions = ['and', 'but', 'or', 'so', 'because', 'although']
    
    return punctuationWords.some(p => currentWord.includes(p)) ||
           conjunctions.includes(nextWord.toLowerCase())
  }

  private analyzeIntonation(pitch: number[], transcript: string): {
    contour: number[];
    range: number;
    naturalness: number;
  } {
    // Smooth pitch contour
    const smoothedPitch = this.smoothPitchContour(pitch)
    
    // Calculate pitch range
    const validPitch = smoothedPitch.filter(p => p > 0)
    const range = validPitch.length > 0 ? 
      Math.max(...validPitch) - Math.min(...validPitch) : 0

    // Analyze naturalness based on contour shape
    const naturalness = this.calculateIntonationNaturalness(smoothedPitch, transcript)

    return {
      contour: smoothedPitch,
      range,
      naturalness
    }
  }

  private smoothPitchContour(pitch: number[]): number[] {
    const smoothed = [...pitch]
    const windowSize = 5

    for (let i = windowSize; i < pitch.length - windowSize; i++) {
      let sum = 0
      let count = 0
      
      for (let j = i - windowSize; j <= i + windowSize; j++) {
        if (pitch[j] > 0) {
          sum += pitch[j]
          count++
        }
      }
      
      if (count > 0) {
        smoothed[i] = sum / count
      }
    }

    return smoothed
  }

  private calculateIntonationNaturalness(pitch: number[], transcript: string): number {
    // Check for appropriate intonation patterns
    const isQuestion = transcript.trim().endsWith('?')
    const isStatement = transcript.trim().endsWith('.')
    
    if (pitch.length < 10) return 0.7

    const startPitch = this.getAveragePitch(pitch.slice(0, Math.floor(pitch.length * 0.2)))
    const endPitch = this.getAveragePitch(pitch.slice(Math.floor(pitch.length * 0.8)))
    
    if (startPitch === 0 || endPitch === 0) return 0.6

    const pitchChange = (endPitch - startPitch) / startPitch

    if (isQuestion) {
      // Questions typically have rising intonation
      return pitchChange > 0.1 ? 0.9 : 0.5
    } else if (isStatement) {
      // Statements typically have falling intonation
      return pitchChange < -0.05 ? 0.9 : 0.6
    }

    return 0.7 // Neutral for other cases
  }

  private getAveragePitch(pitchSegment: number[]): number {
    const validPitch = pitchSegment.filter(p => p > 0)
    return validPitch.length > 0 ? 
      validPitch.reduce((sum, p) => sum + p, 0) / validPitch.length : 0
  }

  private analyzePace(
    wordTimings: Array<{ word: string; start: number; end: number }>,
    transcript: string,
    duration: number
  ): { wordsPerMinute: number; pausePattern: number[]; fluency: number } {
    const words = transcript.split(/\s+/).filter(w => w.length > 0)
    const wordsPerMinute = (words.length / duration) * 60

    const pausePattern = this.extractPausePattern(wordTimings)
    const fluency = this.calculateFluency(wordsPerMinute, pausePattern)

    return {
      wordsPerMinute,
      pausePattern,
      fluency
    }
  }

  private extractPausePattern(wordTimings: Array<{ word: string; start: number; end: number }>): number[] {
    const pauses = []
    for (let i = 1; i < wordTimings.length; i++) {
      const pause = wordTimings[i].start - wordTimings[i - 1].end
      pauses.push(Math.max(0, pause))
    }
    return pauses
  }

  private calculateFluency(wordsPerMinute: number, pausePattern: number[]): number {
    // Optimal speaking rate is around 150-180 WPM
    const rateScore = wordsPerMinute >= 120 && wordsPerMinute <= 200 ? 1.0 : 
                     wordsPerMinute >= 100 && wordsPerMinute <= 250 ? 0.8 : 0.6

    // Analyze pause appropriateness
    const avgPause = pausePattern.reduce((sum, p) => sum + p, 0) / pausePattern.length
    const pauseScore = avgPause >= 0.1 && avgPause <= 0.5 ? 1.0 : 0.7

    return (rateScore + pauseScore) / 2
  }
}