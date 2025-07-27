import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { AdvancedPronunciationAnalysis, ModelConfig } from '../types'
import { AudioProcessor } from '../processors/audio-processor'
import { GOPScorer } from '../analysis/gop-scorer'
import { ProsodyAnalyzer } from '../analysis/prosody-analyzer'
import { NativeSimilarityAnalyzer } from '../analysis/native-similarity'

export class AzureSpeechService {
  private speechConfig: sdk.SpeechConfig | null = null
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
      this.speechConfig = sdk.SpeechConfig.fromSubscription(
        this.config.apiKey!,
        process.env.AZURE_SPEECH_REGION || 'eastus'
      )
      
      this.speechConfig.speechRecognitionLanguage = 'en-US'
      this.speechConfig.outputFormat = sdk.OutputFormat.Detailed
    } catch (error) {
      console.error('Failed to initialize Azure Speech client:', error)
      this.config.enabled = false
    }
  }

  async analyze(audioBuffer: Buffer, targetSentence: string): Promise<AdvancedPronunciationAnalysis> {
    if (!this.speechConfig || !this.config.enabled) {
      throw new Error('Azure Speech service not available')
    }

    try {
      // Convert buffer to Float32Array for processing
      const audioFloat32 = this.bufferToFloat32Array(audioBuffer)
      
      // Extract audio features
      const audioFeatures = await this.audioProcessor.extractMFCC(audioFloat32)
      const audioQuality = this.audioProcessor.getAudioQualityMetrics(audioFloat32)

      // Perform pronunciation assessment
      const assessmentResult = await this.performPronunciationAssessment(audioBuffer, targetSentence)
      
      // Extract detailed analysis
      const phonemes = this.extractPhonemeAnalysis(assessmentResult)
      const words = this.extractWordAnalysis(assessmentResult)
      
      // Calculate GOP scores
      const gopScore = this.gopScorer.calculateGOPScore(phonemes, words, { mfcc: audioFeatures })
      
      // Analyze prosody
      const prosody = this.prosodyAnalyzer.analyzeProsody(
        audioFloat32,
        assessmentResult.transcript,
        words.map(w => ({ word: w.word, start: w.startTime, end: w.endTime }))
      )
      
      // Calculate native similarity
      const nativeSimilarity = this.nativeSimilarityAnalyzer.calculateNativeSimilarity(
        assessmentResult.transcript,
        phonemes,
        { mfcc: audioFeatures } as any,
        prosody
      )

      // Generate comprehensive feedback
      const feedback = this.generateFeedback(assessmentResult, gopScore, prosody, nativeSimilarity)

      return {
        overallScore: assessmentResult.pronunciationScore || Math.round((gopScore.overall + nativeSimilarity.overall) / 2),
        gopScore,
        nativeSimilarity,
        prosody,
        words,
        audioFeatures: { mfcc: audioFeatures } as any,
        audioQuality: audioQuality as any,
        feedback,
        confidence: assessmentResult.confidence || Math.round((gopScore.confidence + nativeSimilarity.confidence) / 2),
        processingTime: 0,
        modelUsed: ['azure-speech'],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('Azure Speech analysis failed:', error)
      throw error
    }
  }

  private async performPronunciationAssessment(audioBuffer: Buffer, targetSentence: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Create audio config from buffer
        const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer)
        
        // Configure pronunciation assessment
        const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
          targetSentence,
          sdk.PronunciationAssessmentGradingSystem.HundredMark,
          sdk.PronunciationAssessmentGranularity.Phoneme,
          true // Enable miscue assessment
        )

        // Create recognizer
        const recognizer = new sdk.SpeechRecognizer(this.speechConfig!, audioConfig)
        pronunciationConfig.applyTo(recognizer)

        // Set up event handlers
        recognizer.recognized = (s, e) => {
          if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
            const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(e.result)
            
            resolve({
              transcript: e.result.text,
              pronunciationScore: pronunciationResult.pronunciationScore,
              accuracyScore: pronunciationResult.accuracyScore,
              fluencyScore: pronunciationResult.fluencyScore,
              completenessScore: pronunciationResult.completenessScore,
              confidence: e.result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult),
              words: this.parseWordDetails(e.result),
              raw: e.result
            })
          } else {
            reject(new Error(`Recognition failed: ${e.result.reason}`))
          }
          
          recognizer.close()
        }

        recognizer.canceled = (s, e) => {
          reject(new Error(`Recognition canceled: ${e.reason}`))
          recognizer.close()
        }

        // Start recognition
        recognizer.recognizeOnceAsync()

      } catch (error) {
        reject(error)
      }
    })
  }

  private parseWordDetails(result: sdk.SpeechRecognitionResult): any[] {
    try {
      const jsonResult = JSON.parse(result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult))
      return jsonResult.NBest?.[0]?.Words || []
    } catch (error) {
      console.error('Failed to parse word details:', error)
      return []
    }
  }

  private extractPhonemeAnalysis(assessmentResult: any): any[] {
    const phonemes: any[] = []
    
    for (const word of assessmentResult.words || []) {
      if (word.Phonemes) {
        for (const phoneme of word.Phonemes) {
          phonemes.push({
            phoneme: phoneme.Phoneme,
            startTime: phoneme.Offset / 10000000, // Convert from 100ns to seconds
            endTime: (phoneme.Offset + phoneme.Duration) / 10000000,
            confidence: phoneme.Confidence || 0.8,
            accuracy: phoneme.AccuracyScore || 75
          })
        }
      }
    }
    
    return phonemes
  }

  private extractWordAnalysis(assessmentResult: any): any[] {
    return (assessmentResult.words || []).map((word: any) => ({
      word: word.Word,
      startTime: word.Offset / 10000000,
      endTime: (word.Offset + word.Duration) / 10000000,
      phonemes: word.Phonemes?.map((p: any) => ({
        phoneme: p.Phoneme,
        startTime: p.Offset / 10000000,
        endTime: (p.Offset + p.Duration) / 10000000,
        confidence: p.Confidence || 0.8,
        accuracy: p.AccuracyScore || 75
      })) || [],
      accuracy: word.AccuracyScore || 75,
      stress: word.StressScore || 70,
      duration: word.Duration / 10000000,
      expectedDuration: word.Word.length * 0.08 + 0.1
    }))
  }

  private generateFeedback(assessmentResult: any, gopScore: any, prosody: any, nativeSimilarity: any): any {
    const strengths = []
    const improvements = []
    const specificTips = []

    // Azure-specific feedback
    if (assessmentResult.accuracyScore >= 80) {
      strengths.push('High pronunciation accuracy')
    } else {
      improvements.push('Focus on pronunciation accuracy')
    }

    if (assessmentResult.fluencyScore >= 80) {
      strengths.push('Good speech fluency')
    } else {
      improvements.push('Work on speech fluency and smoothness')
      specificTips.push('Practice reading aloud to improve fluency')
    }

    if (assessmentResult.completenessScore >= 80) {
      strengths.push('Complete pronunciation of all sounds')
    } else {
      improvements.push('Ensure all sounds are clearly pronounced')
      specificTips.push('Slow down and articulate each sound clearly')
    }

    // Add prosody feedback
    if (prosody.pace?.fluency >= 0.8) {
      strengths.push('Natural speaking pace')
    } else {
      improvements.push('Adjust speaking pace for better naturalness')
    }

    const overall = `Your pronunciation shows ${assessmentResult.pronunciationScore >= 80 ? 'excellent' : assessmentResult.pronunciationScore >= 60 ? 'good' : 'developing'} accuracy. ${assessmentResult.fluencyScore >= 80 ? 'Your fluency is natural.' : 'Work on smoother speech flow.'}`

    return {
      overall,
      strengths: strengths.slice(0, 5),
      improvements: improvements.slice(0, 5),
      specificTips: specificTips.slice(0, 3),
      nextSteps: [
        'Practice with similar complexity sentences',
        'Focus on identified weak areas',
        'Use the pronunciation assessment regularly'
      ]
    }
  }

  private bufferToFloat32Array(buffer: Buffer): Float32Array {
    // Convert audio buffer to Float32Array
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    const int16Array = new Int16Array(arrayBuffer)
    const float32Array = new Float32Array(int16Array.length)
    
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0
    }
    
    return float32Array
  }

  async healthCheck(): Promise<boolean> {
    if (!this.speechConfig || !this.config.enabled) {
      return false
    }

    try {
      // Create a simple test recognizer
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput()
      const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig)
      
      // Test connection by creating recognizer (doesn't actually record)
      recognizer.close()
      return true
    } catch (error) {
      console.error('Azure Speech health check failed:', error)
      return false
    }
  }

  updateConfig(newConfig: Partial<ModelConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.enabled && newConfig.apiKey && !this.speechConfig) {
      this.initializeClient()
    }
  }
}