import { type NextRequest, NextResponse } from "next/server"
import { advancedAudioAnalyzer } from "@/lib/audio/advanced-audio-analyzer"
import { rateLimiter } from "@/lib/security/rate-limiter"
import { performanceMonitor } from "@/lib/monitoring/performance-monitor"
import { analysisCache } from "@/lib/cache/analysis-cache"
import { audioProcessingQueue } from "@/lib/queue/audio-queue"
import { dataProtection } from "@/lib/security/data-protection"

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting
    const rateLimitResult = await rateLimiter.checkAudioAnalysisLimit(ip)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded for audio analysis",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          }
        }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const targetSentence = formData.get("targetSentence") as string
    const userId = formData.get("userId") as string || 'anonymous'
    const sessionId = formData.get("sessionId") as string || `session-${Date.now()}`

    if (!audioFile || !targetSentence) {
      return NextResponse.json({ error: "Audio file and target sentence are required" }, { status: 400 })
    }

    // Convert audio file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    // Check cache first
    const cachedAnalysis = await analysisCache.getCachedAnalysis(audioBuffer, targetSentence, userId)
    if (cachedAnalysis) {
      console.log('Returning cached analysis result')
      return NextResponse.json({ analysis: cachedAnalysis })
    }

    // Initialize and analyze with advanced system
    await advancedAudioAnalyzer.initialize()
    
    // Validate audio quality first
    const audioValidation = await advancedAudioAnalyzer.validateAudioQuality(audioBuffer)
    
    if (!audioValidation.isValid) {
      return NextResponse.json({ 
        error: "Audio quality issues detected",
        issues: audioValidation.issues,
        recommendations: audioValidation.recommendations
      }, { status: 400 })
    }

    // Check if we should use queue for processing
    const useQueue = process.env.USE_AUDIO_QUEUE === 'true'
    
    let analysis
    
    if (useQueue) {
      // Add to queue for processing
      const jobId = await audioProcessingQueue.addAnalysisJob(
        audioBuffer,
        targetSentence,
        userId,
        sessionId,
        {
          enableRealTime: false,
          modelPreference: ['gemini', 'google', 'azure', 'local']
        }
      )
      
      if (jobId) {
        return NextResponse.json({ 
          jobId,
          message: "Analysis queued for processing",
          estimatedTime: 30 // seconds
        })
      }
    }
    
    // Direct processing
    analysis = await advancedAudioAnalyzer.analyzeAudio(audioBuffer, targetSentence, {
      enableRealTime: false,
      modelPreference: ['gemini', 'google', 'azure', 'local']
    })

    // Cache the result
    await analysisCache.cacheAnalysis(audioBuffer, targetSentence, analysis, userId)

    // Record performance metrics
    const processingTime = Date.now() - startTime
    await performanceMonitor.recordMetric(
      'audio-analysis',
      processingTime,
      true,
      analysis.modelUsed.join(','),
      userId
    )

    // Record user analytics
    await performanceMonitor.recordUserAnalytics(userId, 'audio_analysis_completed', {
      targetSentence,
      overallScore: analysis.overallScore,
      processingTime,
      modelsUsed: analysis.modelUsed
    })

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error analyzing audio:", error)
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    
    // Record error metrics
    const processingTime = Date.now() - (Date.now() - 1000) // Approximate
    await performanceMonitor.recordMetric(
      'audio-analysis',
      processingTime,
      false,
      'unknown',
      undefined,
      errorMessage
    )
    
    return NextResponse.json({ 
      error: "Failed to analyze audio",
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Get analysis job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 })
    }
    
    const status = await audioProcessingQueue.getJobStatus(jobId)
    
    if (!status) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }
    
    return NextResponse.json(status)
  } catch (error) {
    console.error("Error getting job status:", error)
    return NextResponse.json({ error: "Failed to get job status" }, { status: 500 })
  }
}