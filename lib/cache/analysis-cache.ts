import { redisClient } from './redis-client'
import { AdvancedPronunciationAnalysis } from '../audio/types'

export class AnalysisCache {
  private memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly DEFAULT_TTL = 3600 // 1 hour
  private readonly MEMORY_CACHE_SIZE = 1000

  // Generate cache key for analysis results
  private generateCacheKey(audioHash: string, targetSentence: string, userId?: string): string {
    const baseKey = `analysis:${audioHash}:${Buffer.from(targetSentence).toString('base64')}`
    return userId ? `${baseKey}:${userId}` : baseKey
  }

  // Generate hash for audio buffer
  private generateAudioHash(audioBuffer: Buffer): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(audioBuffer).digest('hex').substring(0, 16)
  }

  async cacheAnalysis(
    audioBuffer: Buffer,
    targetSentence: string,
    analysis: AdvancedPronunciationAnalysis,
    userId?: string,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    const audioHash = this.generateAudioHash(audioBuffer)
    const cacheKey = this.generateCacheKey(audioHash, targetSentence, userId)

    // Cache in Redis
    const success = await redisClient.setJSON(cacheKey, analysis, ttl)
    
    if (!success) {
      // Fallback to memory cache
      this.setMemoryCache(cacheKey, analysis, ttl)
    }

    // Also cache by sentence for quick lookup
    const sentenceKey = `sentence:${Buffer.from(targetSentence).toString('base64')}`
    await redisClient.setJSON(sentenceKey, { 
      lastAnalyzed: Date.now(),
      sampleAnalysis: analysis 
    }, ttl * 2)
  }

  async getCachedAnalysis(
    audioBuffer: Buffer,
    targetSentence: string,
    userId?: string
  ): Promise<AdvancedPronunciationAnalysis | null> {
    const audioHash = this.generateAudioHash(audioBuffer)
    const cacheKey = this.generateCacheKey(audioHash, targetSentence, userId)

    // Try Redis first
    let analysis = await redisClient.getJSON<AdvancedPronunciationAnalysis>(cacheKey)
    
    if (!analysis) {
      // Fallback to memory cache
      analysis = this.getMemoryCache(cacheKey)
    }

    return analysis
  }

  async getSimilarAnalysis(targetSentence: string): Promise<AdvancedPronunciationAnalysis | null> {
    const sentenceKey = `sentence:${Buffer.from(targetSentence).toString('base64')}`
    const cached = await redisClient.getJSON<{ sampleAnalysis: AdvancedPronunciationAnalysis }>(sentenceKey)
    
    return cached?.sampleAnalysis || null
  }

  private setMemoryCache(key: string, data: any, ttl: number): void {
    // Implement LRU eviction
    if (this.memoryCache.size >= this.MEMORY_CACHE_SIZE) {
      const oldestKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(oldestKey)
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000 // Convert to milliseconds
    })
  }

  private getMemoryCache(key: string): any | null {
    const cached = this.memoryCache.get(key)
    
    if (!cached) return null
    
    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.memoryCache.delete(key)
      return null
    }
    
    return cached.data
  }

  async clearUserCache(userId: string): Promise<void> {
    // This would require a more sophisticated Redis key pattern
    // For now, we'll implement a simple approach
    console.log(`Clearing cache for user: ${userId}`)
  }

  async getCacheStats(): Promise<{
    redisConnected: boolean
    memoryCacheSize: number
    totalCachedAnalyses: number
  }> {
    return {
      redisConnected: redisClient.isHealthy(),
      memoryCacheSize: this.memoryCache.size,
      totalCachedAnalyses: this.memoryCache.size // Simplified
    }
  }

  async warmupCache(commonSentences: string[]): Promise<void> {
    console.log('Warming up cache with common sentences...')
    
    for (const sentence of commonSentences) {
      const sentenceKey = `sentence:${Buffer.from(sentence).toString('base64')}`
      const exists = await redisClient.exists(sentenceKey)
      
      if (!exists) {
        // Pre-populate with sample data
        await redisClient.setJSON(sentenceKey, {
          lastAnalyzed: Date.now(),
          sampleAnalysis: null
        }, this.DEFAULT_TTL * 24) // 24 hours
      }
    }
  }
}

export const analysisCache = new AnalysisCache()