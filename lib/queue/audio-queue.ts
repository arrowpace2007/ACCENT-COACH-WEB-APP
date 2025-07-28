import { Queue, Worker, Job } from 'bullmq'
import { redisClient } from '../cache/redis-client'
import { advancedAudioAnalyzer } from '../audio/advanced-audio-analyzer'
import { AdvancedPronunciationAnalysis } from '../audio/types'

interface AudioAnalysisJob {
  audioBuffer: Buffer
  targetSentence: string
  userId: string
  sessionId: string
  priority: number
  options?: {
    modelPreference?: string[]
    userAccent?: string
    enableRealTime?: boolean
  }
}

interface AudioAnalysisResult {
  analysis: AdvancedPronunciationAnalysis
  processingTime: number
  queueTime: number
  success: boolean
  error?: string
}

export class AudioProcessingQueue {
  private queue: Queue<AudioAnalysisJob, AudioAnalysisResult> | null = null
  private worker: Worker<AudioAnalysisJob, AudioAnalysisResult> | null = null
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      if (!redisClient.isHealthy()) {
        console.warn('Redis not available, queue processing disabled')
        return
      }

      // Initialize queue
      this.queue = new Queue<AudioAnalysisJob, AudioAnalysisResult>('audio-analysis', {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 50,      // Keep last 50 failed jobs
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      })

      // Initialize worker
      this.worker = new Worker<AudioAnalysisJob, AudioAnalysisResult>(
        'audio-analysis',
        this.processAudioJob.bind(this),
        {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
          },
          concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5'),
          limiter: {
            max: 10,
            duration: 1000, // 10 jobs per second max
          },
        }
      )

      // Event handlers
      this.worker.on('completed', (job) => {
        console.log(`Audio analysis job ${job.id} completed for user ${job.data.userId}`)
      })

      this.worker.on('failed', (job, err) => {
        console.error(`Audio analysis job ${job?.id} failed:`, err)
      })

      this.worker.on('error', (err) => {
        console.error('Queue worker error:', err)
      })

      this.isInitialized = true
      console.log('Audio processing queue initialized successfully')

    } catch (error) {
      console.error('Failed to initialize audio processing queue:', error)
    }
  }

  async addAnalysisJob(
    audioBuffer: Buffer,
    targetSentence: string,
    userId: string,
    sessionId: string,
    options?: AudioAnalysisJob['options']
  ): Promise<string | null> {
    if (!this.queue || !this.isInitialized) {
      console.warn('Queue not available, processing directly')
      return null
    }

    try {
      const job = await this.queue.add(
        'analyze-audio',
        {
          audioBuffer,
          targetSentence,
          userId,
          sessionId,
          priority: this.calculatePriority(userId, options),
          options,
        },
        {
          priority: this.calculatePriority(userId, options),
          delay: 0,
          jobId: `${userId}-${sessionId}-${Date.now()}`,
        }
      )

      return job.id || null
    } catch (error) {
      console.error('Failed to add analysis job to queue:', error)
      return null
    }
  }

  private calculatePriority(userId: string, options?: AudioAnalysisJob['options']): number {
    // Higher number = higher priority
    let priority = 0
    
    // Premium users get higher priority
    if (this.isPremiumUser(userId)) {
      priority += 10
    }
    
    // Real-time analysis gets higher priority
    if (options?.enableRealTime) {
      priority += 5
    }
    
    return priority
  }

  private isPremiumUser(userId: string): boolean {
    // This would check user subscription status
    // For now, return false as placeholder
    return false
  }

  private async processAudioJob(
    job: Job<AudioAnalysisJob, AudioAnalysisResult>
  ): Promise<AudioAnalysisResult> {
    const startTime = Date.now()
    const queueTime = startTime - job.timestamp

    try {
      console.log(`Processing audio analysis job ${job.id} for user ${job.data.userId}`)

      // Initialize analyzer if needed
      await advancedAudioAnalyzer.initialize()

      // Perform analysis
      const analysis = await advancedAudioAnalyzer.analyzeAudio(
        job.data.audioBuffer,
        job.data.targetSentence,
        job.data.options
      )

      const processingTime = Date.now() - startTime

      // Update job progress
      await job.updateProgress(100)

      return {
        analysis,
        processingTime,
        queueTime,
        success: true,
      }

    } catch (error) {
      console.error(`Audio analysis job ${job.id} failed:`, error)
      
      return {
        analysis: {} as AdvancedPronunciationAnalysis,
        processingTime: Date.now() - startTime,
        queueTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getJobStatus(jobId: string): Promise<{
    status: string
    progress: number
    result?: AudioAnalysisResult
    error?: string
  } | null> {
    if (!this.queue) return null

    try {
      const job = await this.queue.getJob(jobId)
      if (!job) return null

      const state = await job.getState()
      const progress = job.progress as number || 0

      return {
        status: state,
        progress,
        result: job.returnvalue,
        error: job.failedReason,
      }
    } catch (error) {
      console.error('Failed to get job status:', error)
      return null
    }
  }

  async getQueueStats(): Promise<{
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
  }> {
    if (!this.queue) {
      return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
    }

    try {
      const waiting = await this.queue.getWaiting()
      const active = await this.queue.getActive()
      const completed = await this.queue.getCompleted()
      const failed = await this.queue.getFailed()
      const delayed = await this.queue.getDelayed()

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
      }
    } catch (error) {
      console.error('Failed to get queue stats:', error)
      return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
    }
  }

  async pauseQueue(): Promise<void> {
    if (this.queue) {
      await this.queue.pause()
    }
  }

  async resumeQueue(): Promise<void> {
    if (this.queue) {
      await this.queue.resume()
    }
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.close()
    }
    if (this.queue) {
      await this.queue.close()
    }
  }
}

export const audioProcessingQueue = new AudioProcessingQueue()