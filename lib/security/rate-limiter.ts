import { redisClient } from '../cache/redis-client'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

export class RateLimiter {
  private memoryStore = new Map<string, { count: number; resetTime: number }>()

  async checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - config.windowMs
    const resetTime = now + config.windowMs

    // Try Redis first
    if (redisClient.isHealthy()) {
      return this.checkRedisLimit(identifier, config, now, resetTime)
    }

    // Fallback to memory store
    return this.checkMemoryLimit(identifier, config, now, resetTime)
  }

  private async checkRedisLimit(
    identifier: string,
    config: RateLimitConfig,
    now: number,
    resetTime: number
  ): Promise<RateLimitResult> {
    const key = `rate_limit:${identifier}`
    
    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redisClient['client']?.pipeline()
      if (!pipeline) {
        throw new Error('Redis pipeline not available')
      }

      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, now - config.windowMs)
      
      // Count current requests
      pipeline.zcard(key)
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`)
      
      // Set expiration
      pipeline.expire(key, Math.ceil(config.windowMs / 1000))
      
      const results = await pipeline.exec()
      
      if (!results) {
        throw new Error('Redis pipeline execution failed')
      }

      const currentCount = (results[1][1] as number) || 0
      const totalHits = currentCount + 1

      return {
        allowed: totalHits <= config.maxRequests,
        remaining: Math.max(0, config.maxRequests - totalHits),
        resetTime,
        totalHits,
      }

    } catch (error) {
      console.error('Redis rate limit check failed:', error)
      // Fallback to memory store
      return this.checkMemoryLimit(identifier, config, now, resetTime)
    }
  }

  private checkMemoryLimit(
    identifier: string,
    config: RateLimitConfig,
    now: number,
    resetTime: number
  ): RateLimitResult {
    const existing = this.memoryStore.get(identifier)
    
    // Reset if window expired
    if (!existing || now > existing.resetTime) {
      this.memoryStore.set(identifier, { count: 1, resetTime })
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime,
        totalHits: 1,
      }
    }

    // Increment count
    existing.count++
    this.memoryStore.set(identifier, existing)

    return {
      allowed: existing.count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - existing.count),
      resetTime: existing.resetTime,
      totalHits: existing.count,
    }
  }

  // Predefined rate limit configurations
  static readonly configs = {
    audioAnalysis: {
      windowMs: 60000, // 1 minute
      maxRequests: 10, // 10 analyses per minute
    },
    apiGeneral: {
      windowMs: 60000, // 1 minute
      maxRequests: 100, // 100 requests per minute
    },
    authAttempts: {
      windowMs: 900000, // 15 minutes
      maxRequests: 5, // 5 login attempts per 15 minutes
    },
    practiceSession: {
      windowMs: 3600000, // 1 hour
      maxRequests: 50, // 50 practice sessions per hour
    },
  }

  async checkAudioAnalysisLimit(userId: string): Promise<RateLimitResult> {
    return this.checkLimit(`audio:${userId}`, RateLimiter.configs.audioAnalysis)
  }

  async checkApiLimit(ip: string): Promise<RateLimitResult> {
    return this.checkLimit(`api:${ip}`, RateLimiter.configs.apiGeneral)
  }

  async checkAuthLimit(ip: string): Promise<RateLimitResult> {
    return this.checkLimit(`auth:${ip}`, RateLimiter.configs.authAttempts)
  }

  async checkPracticeLimit(userId: string): Promise<RateLimitResult> {
    return this.checkLimit(`practice:${userId}`, RateLimiter.configs.practiceSession)
  }

  // Clean up memory store periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.memoryStore.entries()) {
      if (now > value.resetTime) {
        this.memoryStore.delete(key)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

// Cleanup memory store every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup()
  }, 300000)
}