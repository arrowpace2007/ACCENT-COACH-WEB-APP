import { type NextRequest, NextResponse } from "next/server"
import { generatePracticeSentences } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const { level, focus } = await request.json()

    if (!level) {
      return NextResponse.json({ error: "Level is required" }, { status: 400 })
    }

    const sentences = await generatePracticeSentences(level, focus)

    return NextResponse.json({ sentences })
  } catch (error) {
    console.error("Error in practice sentences API:", error)
    return NextResponse.json({ error: "Failed to generate practice sentences" }, { status: 500 })
  }
}
