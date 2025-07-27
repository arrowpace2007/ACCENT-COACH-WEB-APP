import { AdvancedPronunciationAnalysis, AnalysisConfig, ModelConfig } from '../types'
import { GoogleCloudSpeechService } from './google-speech-service'
import { AzureSpeechService } from './azure-speech-service'
import { GeminiAnalysisService } from './gemini-analysis-service'
import { LocalAnalysisService } from './local-analysis-service'

export class MultiModelAnalyzer {
  private googleService: GoogleCloudSpeechService
  private azureService: AzureSpeechService
  private geminiService: GeminiAnalysisService
  private localService: LocalAnalysisService
  private config: AnalysisConfig

  constructor(config: AnalysisConfig) {
    this.config = config
    this.googleService = new GoogleCloudSpeechService(config.models.google)
    this.azureService = new AzureSpeechService(config.models.azure)
    this.geminiService = new GeminiAnalysisService(config.models.gemini)
    this.localService = new LocalAnalysisService(config.models.local)
  }

  async analyzeAudio(
    audioBuffer: Buffer,
    targetSentence: string,
    userAccent?: string
  ): Promise<AdvancedPronunciationAnalysis> {
    const startTime = Date.now()
    const enabledModels = this.getEnabledModels()
    
    if (enabledModels.length === 0) {
      throw new Error('No analysis models are enabled')
    }

    try {
      // Run analysis with multiple models in parallel
      const analysisPromises = enabledModels.map(async (modelName) => {
        try {
          return await this.runSingleModelAnalysis(modelName, audioBuffer, targetSentence)
        } catch (error) {
          console.error(`${modelName} analysis failed:`, error)
          return null
        }
      })

      const results = await Promise.allSettled(analysisPromises)
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<AdvancedPronunciationAnalysis | null> => 
          result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value!)

      if (successfulResults.length === 0) {
        throw new Error('All analysis models failed')
      }

      // Ensemble the results
      const ensembledResult = this.ensembleResults(successfulResults, enabledModels)
      
      // Add metadata
      ensembledResult.processingTime = Date.now() - startTime
      ensembledResult.modelUsed = enabledModels
      ensembledResult.timestamp = new Date().toISOString()

      return ensembledResult

    } catch (error) {
      console.error('Multi-model analysis failed:', error)
      
      // Fallback to local analysis
      try {
        const fallbackResult = await this.localService.analyze(audioBuffer, targetSentence)
        fallbackResult.processingTime = Date.now() - startTime
        fallbackResult.modelUsed = ['local-fallback']
        fallbackResult.timestamp = new Date().toISOString()
        return fallbackResult
      } catch (fallbackError) {
        console.error('Fallback analysis failed:', fallbackError)
        throw new Error('All analysis methods failed')
      }
    }
  }

  private getEnabledModels(): string[] {
    const models = []
    
    if (this.config.models.google.enabled) models.push('google')
    if (this.config.models.azure.enabled) models.push('azure')
    if (this.config.models.gemini.enabled) models.push('gemini')
    if (this.config.models.local.enabled) models.push('local')
    
    // Sort by priority
    return models.sort((a, b) => {
      const priorityA = this.config.models[a as keyof typeof this.config.models].priority
      const priorityB = this.config.models[b as keyof typeof this.config.models].priority
      return priorityB - priorityA
    })
  }

  private async runSingleModelAnalysis(
    modelName: string,
    audioBuffer: Buffer,
    targetSentence: string
  ): Promise<AdvancedPronunciationAnalysis | null> {
    const timeout = this.config.models[modelName as keyof typeof this.config.models].timeout

    const analysisPromise = this.getModelService(modelName).analyze(audioBuffer, targetSentence)
    
    return Promise.race([
      analysisPromise,
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error(`${modelName} analysis timeout`)), timeout)
      )
    ])
  }

  private getModelService(modelName: string): any {
    switch (modelName) {
      case 'google': return this.googleService
      case 'azure': return this.azureService
      case 'gemini': return this.geminiService
      case 'local': return this.localService
      default: throw new Error(`Unknown model: ${modelName}`)
    }
  }

  private ensembleResults(
    results: AdvancedPronunciationAnalysis[],
    modelNames: string[]
  ): AdvancedPronunciationAnalysis {
    if (results.length === 1) {
      return results[0]
    }

    // Weighted ensemble based on model priorities and confidence
    const weights = this.calculateEnsembleWeights(results, modelNames)
    
    return {
      overallScore: this.weightedAverage(results.map(r => r.overallScore), weights),
      
      gopScore: {
        overall: this.weightedAverage(results.map(r => r.gopScore.overall), weights),
        phonemeLevel: this.ensembleArrays(results.map(r => r.gopScore.phonemeLevel), weights),
        wordLevel: this.ensembleArrays(results.map(r => r.gopScore.wordLevel), weights),
        sentenceLevel: this.weightedAverage(results.map(r => r.gopScore.sentenceLevel), weights),
        confidence: this.weightedAverage(results.map(r => r.gopScore.confidence), weights)
      },

      nativeSimilarity: {
        overall: this.weightedAverage(results.map(r => r.nativeSimilarity.overall), weights),
        phonetic: this.weightedAverage(results.map(r => r.nativeSimilarity.phonetic), weights),
        prosodic: this.weightedAverage(results.map(r => r.nativeSimilarity.prosodic), weights),
        temporal: this.weightedAverage(results.map(r => r.nativeSimilarity.temporal), weights),
        dtwDistance: this.weightedAverage(results.map(r => r.nativeSimilarity.dtwDistance), weights),
        confidence: this.weightedAverage(results.map(r => r.nativeSimilarity.confidence), weights)
      },

      prosody: this.ensembleProsody(results.map(r => r.prosody), weights),
      words: this.ensembleWords(results.map(r => r.words), weights),
      audioFeatures: results[0].audioFeatures, // Use first result's features
      audioQuality: this.ensembleAudioQuality(results.map(r => r.audioQuality), weights),
      
      feedback: this.ensembleFeedback(results.map(r => r.feedback)),
      confidence: this.weightedAverage(results.map(r => r.confidence), weights),
      
      processingTime: 0, // Will be set by caller
      modelUsed: [], // Will be set by caller
      timestamp: '' // Will be set by caller
    }
  }

  private calculateEnsembleWeights(
    results: AdvancedPronunciationAnalysis[],
    modelNames: string[]
  ): number[] {
    const weights = results.map((result, index) => {
      const modelName = modelNames[index]
      const modelPriority = this.config.models[modelName as keyof typeof this.config.models].priority
      const confidence = result.confidence / 100
      
      // Combine priority and confidence
      return modelPriority * 0.6 + confidence * 0.4
    })

    // Normalize weights
    const sum = weights.reduce((acc, w) => acc + w, 0)
    return weights.map(w => w / sum)
  }

  private weightedAverage(values: number[], weights: number[]): number {
    let sum = 0
    let weightSum = 0
    
    for (let i = 0; i < values.length && i < weights.length; i++) {
      sum += values[i] * weights[i]
      weightSum += weights[i]
    }
    
    return weightSum > 0 ? Math.round(sum / weightSum) : 0
  }

  private ensembleArrays(arrays: number[][], weights: number[]): number[] {
    if (arrays.length === 0) return []
    
    const maxLength = Math.max(...arrays.map(arr => arr.length))
    const result = new Array(maxLength).fill(0)
    
    for (let i = 0; i < maxLength; i++) {
      let sum = 0
      let weightSum = 0
      
      for (let j = 0; j < arrays.length; j++) {
        if (i < arrays[j].length) {
          sum += arrays[j][i] * weights[j]
          weightSum += weights[j]
        }
      }
      
      result[i] = weightSum > 0 ? Math.round(sum / weightSum) : 0
    }
    
    return result
  }

  private ensembleProsody(prosodies: any[], weights: number[]): any {
    // Simplified prosody ensemble
    return prosodies[0] // Use first result for now
  }

  private ensembleWords(wordArrays: any[][], weights: number[]): any[] {
    // Use the most detailed word analysis
    return wordArrays.reduce((best, current) => 
      current.length > best.length ? current : best, [])
  }

  private ensembleAudioQuality(qualities: any[], weights: number[]): any {
    return {
      snr: this.weightedAverage(qualities.map(q => q.snr), weights),
      clarity: this.weightedAverage(qualities.map(q => q.clarity), weights),
      volume: this.weightedAverage(qualities.map(q => q.volume), weights),
      backgroundNoise: this.weightedAverage(qualities.map(q => q.backgroundNoise), weights),
      echoCancellation: this.weightedAverage(qualities.map(q => q.echoCancellation || 0), weights),
      distortion: this.weightedAverage(qualities.map(q => q.distortion || 0), weights),
      sampleRate: qualities[0].sampleRate,
      bitDepth: qualities[0].bitDepth,
      duration: qualities[0].duration
    }
  }

  private ensembleFeedback(feedbacks: any[]): any {
    // Combine feedback from all models
    const allStrengths = feedbacks.flatMap(f => f.strengths || [])
    const allImprovements = feedbacks.flatMap(f => f.improvements || [])
    const allTips = feedbacks.flatMap(f => f.specificTips || [])
    
    // Remove duplicates and select best feedback
    const uniqueStrengths = [...new Set(allStrengths)]
    const uniqueImprovements = [...new Set(allImprovements)]
    const uniqueTips = [...new Set(allTips)]
    
    return {
      overall: feedbacks[0].overall || 'Good effort! Keep practicing to improve your pronunciation.',
      strengths: uniqueStrengths.slice(0, 5),
      improvements: uniqueImprovements.slice(0, 5),
      specificTips: uniqueTips.slice(0, 3),
      nextSteps: [
        'Continue practicing with similar sentences',
        'Focus on the identified improvement areas',
        'Record yourself regularly to track progress'
      ]
    }
  }

  async getModelHealth(): Promise<{ [key: string]: boolean }> {
    const health: { [key: string]: boolean } = {}
    
    const models = ['google', 'azure', 'gemini', 'local']
    
    for (const model of models) {
      try {
        const service = this.getModelService(model)
        health[model] = await service.healthCheck()
      } catch (error) {
        health[model] = false
      }
    }
    
    return health
  }

  updateConfig(newConfig: Partial<AnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Update service configurations
    if (newConfig.models?.google) {
      this.googleService.updateConfig(newConfig.models.google)
    }
    if (newConfig.models?.azure) {
      this.azureService.updateConfig(newConfig.models.azure)
    }
    if (newConfig.models?.gemini) {
      this.geminiService.updateConfig(newConfig.models.gemini)
    }
    if (newConfig.models?.local) {
      this.localService.updateConfig(newConfig.models.local)
    }
  }
}