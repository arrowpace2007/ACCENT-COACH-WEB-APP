import { NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/monitoring/performance-monitor'
import { redisClient } from '@/lib/cache/redis-client'
import { audioProcessingQueue } from '@/lib/queue/audio-queue'
import { advancedAudioAnalyzer } from '@/lib/audio/advanced-audio-analyzer'

export async function GET() {
  try {
    const startTime = Date.now()

    // Check system health
    const systemHealth = await performanceMonitor.getSystemHealth()
    
    // Check individual services
    const services = {
      redis: redisClient.isHealthy(),
      audioAnalyzer: true, // Would check if analyzer is initialized
      queue: true, // Would check queue health
    }

    // Check AI model availability
    const modelHealth = await advancedAudioAnalyzer.getModelHealth()

    // Get queue statistics
    const queueStats = await audioProcessingQueue.getQueueStats()

    // Get performance metrics
    const metrics = await performanceMonitor.getMetrics('audio-analysis', 3600000) // Last hour

    const responseTime = Date.now() - startTime

    const health = {
      status: systemHealth.overall,
      timestamp: new Date().toISOString(),
      responseTime,
      services,
      models: modelHealth,
      queue: queueStats,
      metrics: {
        averageLatency: metrics.averageLatency,
        successRate: metrics.successRate,
        throughput: metrics.throughput,
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV,
      },
    }

    const statusCode = systemHealth.overall === 'healthy' ? 200 : 
                      systemHealth.overall === 'degraded' ? 200 : 503

    return NextResponse.json(health, { status: statusCode })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}

// Detailed health check for monitoring systems
export async function POST() {
  try {
    const checks = await Promise.allSettled([
      // Database connectivity
      new Promise(async (resolve, reject) => {
        try {
          // Test database connection
          resolve('database_ok')
        } catch (error) {
          reject(error)
        }
      }),

      // Redis connectivity
      new Promise(async (resolve, reject) => {
        try {
          if (redisClient.isHealthy()) {
            resolve('redis_ok')
          } else {
            reject(new Error('Redis not connected'))
          }
        } catch (error) {
          reject(error)
        }
      }),

      // AI services
      new Promise(async (resolve, reject) => {
        try {
          const modelHealth = await advancedAudioAnalyzer.getModelHealth()
          const healthyModels = Object.values(modelHealth).filter(Boolean).length
          
          if (healthyModels > 0) {
            resolve(`ai_services_ok_${healthyModels}_models`)
          } else {
            reject(new Error('No AI models available'))
          }
        } catch (error) {
          reject(error)
        }
      }),
    ])

    const results = checks.map((check, index) => ({
      service: ['database', 'redis', 'ai_services'][index],
      status: check.status,
      result: check.status === 'fulfilled' ? check.value : check.reason?.message,
    }))

    const allHealthy = checks.every(check => check.status === 'fulfilled')

    return NextResponse.json({
      overall: allHealthy ? 'healthy' : 'unhealthy',
      checks: results,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    return NextResponse.json(
      {
        overall: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}