import { redisClient } from '../cache/redis-client'

interface PerformanceMetric {
  timestamp: number
  duration: number
  success: boolean
  model: string
  userId?: string
  error?: string
}

interface AudioProcessingMetrics {
  averageLatency: number
  successRate: number
  errorRate: number
  throughput: number
  modelPerformance: { [model: string]: number }
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private readonly MAX_METRICS = 10000
  private readonly METRICS_TTL = 86400 // 24 hours

  async recordMetric(
    operation: string,
    duration: number,
    success: boolean,
    model: string,
    userId?: string,
    error?: string
  ): Promise<void> {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      duration,
      success,
      model,
      userId,
      error,
    }

    // Store in memory
    this.metrics.push(metric)
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift()
    }

    // Store in Redis for persistence
    const key = `metrics:${operation}:${Date.now()}`
    await redisClient.setJSON(key, metric, this.METRICS_TTL)

    // Update aggregated metrics
    await this.updateAggregatedMetrics(operation, metric)
  }

  private async updateAggregatedMetrics(operation: string, metric: PerformanceMetric): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const aggregateKey = `metrics:aggregate:${operation}:${today}`
    
    const existing = await redisClient.getJSON<{
      count: number
      totalDuration: number
      successCount: number
      modelCounts: { [model: string]: number }
    }>(aggregateKey)

    const updated = {
      count: (existing?.count || 0) + 1,
      totalDuration: (existing?.totalDuration || 0) + metric.duration,
      successCount: (existing?.successCount || 0) + (metric.success ? 1 : 0),
      modelCounts: {
        ...existing?.modelCounts,
        [metric.model]: (existing?.modelCounts?.[metric.model] || 0) + 1,
      },
    }

    await redisClient.setJSON(aggregateKey, updated, this.METRICS_TTL)
  }

  async getMetrics(operation: string, timeRange: number = 3600000): Promise<AudioProcessingMetrics> {
    const cutoff = Date.now() - timeRange
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)

    if (recentMetrics.length === 0) {
      return {
        averageLatency: 0,
        successRate: 0,
        errorRate: 0,
        throughput: 0,
        modelPerformance: {},
      }
    }

    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0)
    const successCount = recentMetrics.filter(m => m.success).length
    const modelCounts = recentMetrics.reduce((acc, m) => {
      acc[m.model] = (acc[m.model] || 0) + 1
      return acc
    }, {} as { [model: string]: number })

    const modelPerformance = Object.entries(modelCounts).reduce((acc, [model, count]) => {
      const modelMetrics = recentMetrics.filter(m => m.model === model)
      const avgDuration = modelMetrics.reduce((sum, m) => sum + m.duration, 0) / modelMetrics.length
      acc[model] = avgDuration
      return acc
    }, {} as { [model: string]: number })

    return {
      averageLatency: totalDuration / recentMetrics.length,
      successRate: successCount / recentMetrics.length,
      errorRate: (recentMetrics.length - successCount) / recentMetrics.length,
      throughput: recentMetrics.length / (timeRange / 1000), // per second
      modelPerformance,
    }
  }

  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy'
    services: {
      redis: boolean
      audioAnalysis: boolean
      queue: boolean
    }
    metrics: AudioProcessingMetrics
  }> {
    const metrics = await this.getMetrics('audio-analysis')
    
    const services = {
      redis: redisClient.isHealthy(),
      audioAnalysis: metrics.successRate > 0.8,
      queue: true, // Would check queue health
    }

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (metrics.successRate < 0.5 || !services.redis) {
      overall = 'unhealthy'
    } else if (metrics.successRate < 0.8 || metrics.averageLatency > 10000) {
      overall = 'degraded'
    }

    return {
      overall,
      services,
      metrics,
    }
  }

  async getErrorAnalysis(timeRange: number = 3600000): Promise<{
    totalErrors: number
    errorsByModel: { [model: string]: number }
    commonErrors: { [error: string]: number }
    errorRate: number
  }> {
    const cutoff = Date.now() - timeRange
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    const errors = recentMetrics.filter(m => !m.success)

    const errorsByModel = errors.reduce((acc, m) => {
      acc[m.model] = (acc[m.model] || 0) + 1
      return acc
    }, {} as { [model: string]: number })

    const commonErrors = errors.reduce((acc, m) => {
      if (m.error) {
        acc[m.error] = (acc[m.error] || 0) + 1
      }
      return acc
    }, {} as { [error: string]: number })

    return {
      totalErrors: errors.length,
      errorsByModel,
      commonErrors,
      errorRate: errors.length / recentMetrics.length,
    }
  }

  async recordUserAnalytics(
    userId: string,
    event: string,
    data: any
  ): Promise<void> {
    const analyticsKey = `analytics:${userId}:${event}:${Date.now()}`
    await redisClient.setJSON(analyticsKey, {
      userId,
      event,
      data,
      timestamp: Date.now(),
    }, this.METRICS_TTL)
  }

  async getUserProgress(userId: string, timeRange: number = 2592000000): Promise<{
    totalSessions: number
    averageScore: number
    improvement: number
    streakDays: number
  }> {
    // This would aggregate user-specific metrics
    // For now, return placeholder data
    return {
      totalSessions: 0,
      averageScore: 0,
      improvement: 0,
      streakDays: 0,
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()