import { type NextRequest, NextResponse } from "next/server"
import { analyzeAudioWithGemini } from "@/lib/gemini"

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

    // Analyze with Gemini
    const analysis = await analyzeAudioWithGemini(audioBuffer, targetSentence)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error analyzing audio:", error)
    return NextResponse.json({ error: "Failed to analyze audio" }, { status: 500 })
  }
}
