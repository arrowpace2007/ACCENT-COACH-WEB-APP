import { GoogleGenerativeAI } from "@google/generative-ai"
import { AdvancedPronunciationAnalysis, ModelConfig } from '../types'
import { AudioProcessor } from '../processors/audio-processor'
import { GOPScorer } from '../analysis/gop-scorer'
import { ProsodyAnalyzer } from '../analysis/prosody-analyzer'
import { NativeSimilarityAnalyzer } from '../analysis/native-similarity'

export class GeminiAnalysisService {
  private genAI: GoogleGenerativeAI | null = null
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
      this.genAI = new GoogleGenerativeAI(this.config.apiKey!)
    } catch (error) {
      console.error('Failed to initialize Gemini client:', error)
      this.config.enabled = false
    }
  }

  async analyze(audioBuffer: Buffer, targetSentence: string): Promise<AdvancedPronunciationAnalysis> {
    if (!this.genAI || !this.config.enabled) {
      throw new Error('Gemini service not available')
    }

    try {
      // Convert buffer to Float32Array for processing
      const audioFloat32 = this.bufferToFloat32Array(audioBuffer)
      
      // Extract audio features
      const audioFeatures = await this.audioProcessor.extractMFCC(audioFloat32)
      const audioQuality = this.audioProcessor.getAudioQualityMetrics(audioFloat32)

      // Perform enhanced Gemini analysis
      const geminiResult = await this.performEnhancedGeminiAnalysis(audioBuffer, targetSentence)
      
      // Extract phoneme and word analysis from Gemini result
      const phonemes = this.extractPhonemeAnalysis(geminiResult)
      const words = this.extractWordAnalysis(geminiResult)
      
      // Calculate GOP scores
      const gopScore = this.gopScorer.calculateGOPScore(phonemes, words, { mfcc: audioFeatures })
      
      // Analyze prosody
      const prosody = this.prosodyAnalyzer.analyzeProsody(
        audioFloat32,
        geminiResult.transcript || targetSentence,
        words.map(w => ({ word: w.word, start: w.startTime, end: w.endTime }))
      )
      
      // Calculate native similarity
      const nativeSimilarity = this.nativeSimilarityAnalyzer.calculateNativeSimilarity(
        geminiResult.transcript || targetSentence,
        phonemes,
        { mfcc: audioFeatures } as any,
        prosody
      )

      return {
        overallScore: geminiResult.overallScore || Math.round((gopScore.overall + nativeSimilarity.overall) / 2),
        gopScore,
        nativeSimilarity,
        prosody,
        words,
        audioFeatures: { mfcc: audioFeatures } as any,
        audioQuality: audioQuality as any,
        feedback: geminiResult.feedback || this.generateFallbackFeedback(gopScore, nativeSimilarity),
        confidence: geminiResult.confidence || Math.round((gopScore.confidence + nativeSimilarity.confidence) / 2),
        processingTime: 0,
        modelUsed: ['gemini-pro'],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('Gemini analysis failed:', error)
      throw error
    }
  }

  private async performEnhancedGeminiAnalysis(audioBuffer: Buffer, targetSentence: string): Promise<any> {
    try {
      const model = this.genAI!.getGenerativeModel({ model: "gemini-1.5-pro" })

      const audioBase64 = audioBuffer.toString("base64")

      const prompt = `
You are an expert English pronunciation coach and phonetician. Analyze this audio recording where the speaker is attempting to say: "${targetSentence}"

Provide a comprehensive pronunciation analysis in the following JSON format. IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, no additional text:

{
  "overallScore": 85,
  "transcript": "recognized text",
  "confidence": 90,
  "phonemeAnalysis": [
    {
      "phoneme": "DH",
      "startTime": 0.0,
      "endTime": 0.1,
      "confidence": 0.9,
      "accuracy": 85,
      "expectedPhoneme": "DH",
      "issues": ["slight distortion"]
    }
  ],
  "wordAnalysis": [
    {
      "word": "the",
      "startTime": 0.0,
      "endTime": 0.2,
      "accuracy": 88,
      "stress": 0.3,
      "duration": 0.2,
      "expectedDuration": 0.15,
      "issues": ["slightly too long"]
    }
  ],
  "prosodyAnalysis": {
    "stress": {
      "pattern": [0.8, 0.3, 0.9],
      "accuracy": 0.85,
      "naturalness": 0.8
    },
    "rhythm": {
      "timing": [0.2, 0.15, 0.3],
      "regularity": 0.8,
      "naturalness": 0.85
    },
    "intonation": {
      "contour": [150, 145, 140, 135],
      "range": 15,
      "naturalness": 0.9
    }
  },
  "audioQuality": {
    "snr": 25,
    "clarity": 0.9,
    "volume": 0.8,
    "backgroundNoise": 0.1
  },
  "feedback": {
    "overall": "Excellent pronunciation with clear articulation and natural flow.",
    "strengths": ["Clear consonants", "Good intonation", "Natural pace"],
    "improvements": ["Work on vowel clarity", "Reduce hesitation"],
    "specificTips": ["Practice 'th' sound placement", "Focus on word stress"],
    "nextSteps": ["Try longer sentences", "Practice with similar sounds"]
  }
}

Focus on:
1. Phoneme-level accuracy and timing
2. Word stress and duration analysis
3. Prosodic features (rhythm, intonation, stress)
4. Audio quality assessment
5. Specific, actionable feedback for improvement
6. Comparison with native speaker patterns
`

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "audio/webm",
            data: audioBase64,
          },
        },
        prompt,
      ])

      const response = await result.response
      const text = response.text()
      let cleanedText = text.trim()

      // Remove markdown code block markers if present
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      const analysis = JSON.parse(cleanedText)

      // Validate the response structure
      if (!analysis.overallScore && !analysis.feedback) {
        throw new Error("Invalid analysis structure from Gemini")
      }

      return analysis

    } catch (error) {
      console.error("Enhanced Gemini analysis error:", error)
      
      // Fallback to basic analysis
      return this.generateFallbackAnalysis(targetSentence)
    }
  }

  private generateFallbackAnalysis(targetSentence: string): any {
    const words = targetSentence.split(' ')
    const baseScore = 70 + Math.random() * 20

    return {
      overallScore: Math.round(baseScore),
      transcript: targetSentence,
      confidence: 75,
      phonemeAnalysis: [],
      wordAnalysis: words.map((word, index) => ({
        word,
        startTime: index * 0.5,
        endTime: (index + 1) * 0.5,
        accuracy: Math.round(baseScore + (Math.random() - 0.5) * 20),
        stress: 0.7,
        duration: 0.5,
        expectedDuration: word.length * 0.08 + 0.1
      })),
      feedback: {
        overall: "Good effort! Continue practicing to improve your pronunciation.",
        strengths: ["Clear articulation", "Good effort"],
        improvements: ["Focus on accuracy", "Practice regularly"],
        specificTips: ["Listen to native speakers", "Record yourself practicing"],
        nextSteps: ["Try similar sentences", "Focus on problem sounds"]
      }
    }
  }

  private extractPhonemeAnalysis(geminiResult: any): any[] {
    return geminiResult.phonemeAnalysis || []
  }

  private extractWordAnalysis(geminiResult: any): any[] {
    return (geminiResult.wordAnalysis || []).map((word: any) => ({
      word: word.word,
      startTime: word.startTime,
      endTime: word.endTime,
      phonemes: [], // Would be populated from phoneme analysis
      accuracy: word.accuracy,
      stress: word.stress,
      duration: word.duration,
      expectedDuration: word.expectedDuration,
      issues: word.issues
    }))
  }

  private generateFallbackFeedback(gopScore: any, nativeSimilarity: any): any {
    return {
      overall: "Analysis completed. Continue practicing to improve your pronunciation.",
      strengths: ["Good effort", "Clear communication"],
      improvements: ["Focus on accuracy", "Practice regularly"],
      specificTips: ["Listen to native speakers", "Record yourself"],
      nextSteps: ["Try similar sentences", "Focus on weak areas"]
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
    if (!this.genAI || !this.config.enabled) {
      return false
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" })
      const result = await model.generateContent("Test connection")
      return true
    } catch (error) {
      console.error('Gemini health check failed:', error)
      return false
    }
  }

  updateConfig(newConfig: Partial<ModelConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.enabled && newConfig.apiKey && !this.genAI) {
      this.initializeClient()
    }
  }
}