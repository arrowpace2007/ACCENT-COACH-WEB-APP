import { type NextRequest, NextResponse } from "next/server"
import { advancedAudioAnalyzer } from "@/lib/audio/advanced-audio-analyzer"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const targetSentence = formData.get("targetSentence") as string

    if (!audioFile || !targetSentence) {
      return NextResponse.json({ error: "Audio file and target sentence are required" }, { status: 400 })
    }

    // Convert audio file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

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

    // Perform advanced analysis
    const analysis = await advancedAudioAnalyzer.analyzeAudio(audioBuffer, targetSentence, {
      enableRealTime: false,
      modelPreference: ['gemini', 'google', 'azure', 'local']
    })

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error analyzing audio:", error)
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ 
      error: "Failed to analyze audio",
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
