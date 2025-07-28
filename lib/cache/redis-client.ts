import Redis from 'ioredis'

class RedisClient {
  private client: Redis | null = null
  private isConnected = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    try {
      const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
      
      if (!redisUrl) {
        console.warn('Redis URL not configured, using memory cache fallback')
        return
      }

      this.client = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
      })

      this.client.on('connect', () => {
        console.log('Redis connected successfully')
        this.isConnected = true
      })

      this.client.on('error', (error) => {
        console.error('Redis connection error:', error)
        this.isConnected = false
      })

      this.client.on('close', () => {
        console.log('Redis connection closed')
        this.isConnected = false
      })

    } catch (error) {
      console.error('Failed to initialize Redis client:', error)
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      return null
    }

    try {
      return await this.client.get(key)
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false
    }

    try {
      if (ttl) {
        await this.client.setex(key, ttl, value)
      } else {
        await this.client.set(key, value)
      }
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false
    }

    try {
      await this.client.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false
    }

    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  }

  async setJSON(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value)
      return await this.set(key, jsonString, ttl)
    } catch (error) {
      console.error('Redis setJSON error:', error)
      return false
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.get(key)
      if (!jsonString) return null
      return JSON.parse(jsonString) as T
    } catch (error) {
      console.error('Redis getJSON error:', error)
      return null
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.isConnected = false
    }
  }

  isHealthy(): boolean {
    return this.isConnected
  }
}

export const redisClient = new RedisClient()