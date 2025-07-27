import { SpeechClient } from '@google-cloud/speech'
import { AdvancedPronunciationAnalysis, ModelConfig, PhonemeAnalysis, WordAnalysis } from '../types'
import { AudioProcessor } from '../processors/audio-processor'
import { GOPScorer } from '../analysis/gop-scorer'
import { ProsodyAnalyzer } from '../analysis/prosody-analyzer'
import { NativeSimilarityAnalyzer } from '../analysis/native-similarity'

export class GoogleCloudSpeechService {
  private client: SpeechClient | null = null
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
    
    if (config.enabled && config.apiKey) {
      this.initializeClient()
    }
  }

  private initializeClient(): void {
    try {
      // Initialize Google Cloud Speech client
      this.client = new SpeechClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
      })
    } catch (error) {
      console.error('Failed to initialize Google Speech client:', error)
      this.config.enabled = false
    }
  }

  async analyze(audioBuffer: Buffer, targetSentence: string): Promise<AdvancedPronunciationAnalysis> {
    if (!this.client || !this.config.enabled) {
      throw new Error('Google Speech service not available')
    }

    try {
      // Convert buffer to Float32Array for processing
      const audioFloat32 = this.bufferToFloat32Array(audioBuffer)
      
      // Extract audio features
      const audioFeatures = await this.audioProcessor.extractMFCC(audioFloat32)
      const audioQuality = this.audioProcessor.getAudioQualityMetrics(audioFloat32)

      // Perform speech recognition with detailed results
      const recognitionResult = await this.performSpeechRecognition(audioBuffer, targetSentence)
      
      // Extract phoneme and word analysis
      const phonemes = this.extractPhonemeAnalysis(recognitionResult)
      const words = this.extractWordAnalysis(recognitionResult)
      
      // Calculate GOP scores
      const gopScore = this.gopScorer.calculateGOPScore(phonemes, words, { mfcc: audioFeatures })
      
      // Analyze prosody
      const prosody = this.prosodyAnalyzer.analyzeProsody(
        audioFloat32,
        recognitionResult.transcript,
        words.map(w => ({ word: w.word, start: w.startTime, end: w.endTime }))
      )
      
      // Calculate native similarity
      const nativeSimilarity = this.nativeSimilarityAnalyzer.calculateNativeSimilarity(
        recognitionResult.transcript,
        phonemes,
        { mfcc: audioFeatures } as any,
        prosody
      )

      // Generate comprehensive feedback
      const feedback = this.generateFeedback(gopScore, prosody, nativeSimilarity, words)

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
        processingTime: 0, // Will be set by caller
        modelUsed: ['google-cloud-speech'],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('Google Speech analysis failed:', error)
      throw error
    }
  }

  private async performSpeechRecognition(audioBuffer: Buffer, targetSentence: string): Promise<any> {
    const request = {
      audio: {
        content: audioBuffer.toString('base64')
      },
      config: {
        encoding: 'WEBM_OPUS' as const,
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        enableWordTimeOffsets: true,
        enableWordConfidence: true,
        enableAutomaticPunctuation: true,
        model: 'latest_long',
        useEnhanced: true,
        speechContexts: [{
          phrases: [targetSentence],
          boost: 20
        }],
        metadata: {
          interactionType: 'PRONUNCIATION_ASSESSMENT' as const,
          microphoneDistance: 'NEARFIELD' as const,
          recordingDeviceType: 'PC' as const
        }
      }
    }

    const [response] = await this.client!.recognize(request)
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No speech recognition results')
    }

    const result = response.results[0]
    const alternative = result.alternatives?.[0]
    
    if (!alternative) {
      throw new Error('No recognition alternative found')
    }

    return {
      transcript: alternative.transcript || '',
      confidence: alternative.confidence || 0,
      words: alternative.words || [],
      raw: response
    }
  }

  private extractPhonemeAnalysis(recognitionResult: any): PhonemeAnalysis[] {
    // Google Cloud Speech doesn't provide phoneme-level analysis directly
    // We'll estimate phonemes from word-level data
    const phonemes: PhonemeAnalysis[] = []
    
    for (const word of recognitionResult.words || []) {
      const wordPhonemes = this.estimateWordPhonemes(word.word, word.startTime, word.endTime)
      phonemes.push(...wordPhonemes)
    }
    
    return phonemes
  }

  private estimateWordPhonemes(word: string, startTime: number, endTime: number): PhonemeAnalysis[] {
    // Simplified phoneme estimation
    // In production, use a proper phoneme dictionary or G2P model
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

    const phonemes = phonemeMap[word.toLowerCase()] || [word.toUpperCase()]
    const duration = (endTime - startTime) / phonemes.length
    
    return phonemes.map((phoneme, index) => ({
      phoneme,
      startTime: startTime + index * duration,
      endTime: startTime + (index + 1) * duration,
      confidence: 0.8,
      accuracy: 75 + Math.random() * 20 // Placeholder
    }))
  }

  private extractWordAnalysis(recognitionResult: any): WordAnalysis[] {
    return (recognitionResult.words || []).map((word: any) => ({
      word: word.word,
      startTime: parseFloat(word.startTime?.seconds || 0) + (word.startTime?.nanos || 0) / 1e9,
      endTime: parseFloat(word.endTime?.seconds || 0) + (word.endTime?.nanos || 0) / 1e9,
      phonemes: this.estimateWordPhonemes(
        word.word,
        parseFloat(word.startTime?.seconds || 0) + (word.startTime?.nanos || 0) / 1e9,
        parseFloat(word.endTime?.seconds || 0) + (word.endTime?.nanos || 0) / 1e9
      ),
      accuracy: (word.confidence || 0.8) * 100,
      stress: 0.7, // Placeholder
      duration: (parseFloat(word.endTime?.seconds || 0) + (word.endTime?.nanos || 0) / 1e9) -
                (parseFloat(word.startTime?.seconds || 0) + (word.startTime?.nanos || 0) / 1e9),
      expectedDuration: word.word.length * 0.08 + 0.1 // Rough estimate
    }))
  }

  private generateFeedback(gopScore: any, prosody: any, nativeSimilarity: any, words: any[]): any {
    const strengths = []
    const improvements = []
    const specificTips = []

    // Analyze GOP scores
    if (gopScore.overall >= 80) {
      strengths.push('Excellent overall pronunciation accuracy')
    } else if (gopScore.overall >= 60) {
      strengths.push('Good pronunciation with room for improvement')
    } else {
      improvements.push('Focus on basic pronunciation accuracy')
    }

    // Analyze prosody
    if (prosody.stress?.naturalness >= 0.8) {
      strengths.push('Natural stress patterns')
    } else {
      improvements.push('Work on word stress patterns')
      specificTips.push('Practice emphasizing the correct syllables in multi-syllable words')
    }

    if (prosody.rhythm?.naturalness >= 0.8) {
      strengths.push('Good speech rhythm')
    } else {
      improvements.push('Improve speech rhythm and timing')
      specificTips.push('Practice with a metronome to develop consistent rhythm')
    }

    if (prosody.intonation?.naturalness >= 0.8) {
      strengths.push('Natural intonation patterns')
    } else {
      improvements.push('Work on intonation and melody')
      specificTips.push('Listen to native speakers and mimic their pitch patterns')
    }

    // Analyze native similarity
    if (nativeSimilarity.overall >= 85) {
      strengths.push('Very native-like pronunciation')
    } else if (nativeSimilarity.overall >= 70) {
      strengths.push('Good similarity to native speakers')
    } else {
      improvements.push('Focus on sounding more like native speakers')
    }

    const overall = this.generateOverallFeedback(gopScore.overall, nativeSimilarity.overall)

    return {
      overall,
      strengths: strengths.slice(0, 5),
      improvements: improvements.slice(0, 5),
      specificTips: specificTips.slice(0, 3),
      nextSteps: [
        'Continue practicing with similar sentences',
        'Focus on the identified improvement areas',
        'Record yourself regularly to track progress'
      ]
    }
  }

  private generateOverallFeedback(gopScore: number, nativeSimilarity: number): string {
    const avgScore = (gopScore + nativeSimilarity) / 2

    if (avgScore >= 90) {
      return 'Outstanding pronunciation! You sound very natural and clear. Keep up the excellent work!'
    } else if (avgScore >= 80) {
      return 'Great pronunciation! You\'re speaking clearly with good accuracy. Minor refinements will make you sound even more natural.'
    } else if (avgScore >= 70) {
      return 'Good pronunciation with clear communication. Focus on the specific areas mentioned to improve further.'
    } else if (avgScore >= 60) {
      return 'Your pronunciation is understandable but needs improvement. Practice the highlighted areas regularly.'
    } else {
      return 'Keep practicing! Focus on basic pronunciation accuracy and listen to native speakers for guidance.'
    }
  }

  private bufferToFloat32Array(buffer: Buffer): Float32Array {
    // Convert audio buffer to Float32Array
    // This is a simplified conversion - in production, use proper audio decoding
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    const int16Array = new Int16Array(arrayBuffer)
    const float32Array = new Float32Array(int16Array.length)
    
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0
    }
    
    return float32Array
  }

  async healthCheck(): Promise<boolean> {
    if (!this.client || !this.config.enabled) {
      return false
    }

    try {
      // Perform a simple recognition test
      const testAudio = Buffer.alloc(1024) // Silent audio
      const request = {
        audio: { content: testAudio.toString('base64') },
        config: {
          encoding: 'LINEAR16' as const,
          sampleRateHertz: 16000,
          languageCode: 'en-US'
        }
      }

      await this.client.recognize(request)
      return true
    } catch (error) {
      console.error('Google Speech health check failed:', error)
      return false
    }
  }

  updateConfig(newConfig: Partial<ModelConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.enabled && newConfig.apiKey && !this.client) {
      this.initializeClient()
    }
  }
}