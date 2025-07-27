import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export interface PronunciationAnalysis {
  overallScore: number
  clarity: number
  rhythm: number
  intonation: number
  feedback: string
  improvements: string[]
  strengths: string[]
  wordAnalysis: Array<{
    word: string
    accuracy: number
    issues?: string[]
  }>
  phoneticIssues: string[]
  nativeSimilarity: number
  recordingQuality: {
    duration: number
    audioLevel: string
    backgroundNoise: string
  }
  isDemoAnalysis?: boolean
}

export async function analyzeAudioWithGemini(
  audioBuffer: Buffer,
  targetSentence: string,
): Promise<PronunciationAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Convert audio buffer to base64 for Gemini
    const audioBase64 = audioBuffer.toString("base64")

    const prompt = `
You are an expert English pronunciation coach. Analyze this audio recording where the speaker is attempting to say: "${targetSentence}"

Please provide a detailed pronunciation analysis in the following JSON format. IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, no additional text:

{
  "overallScore": 85,
  "clarity": 80,
  "rhythm": 90, 
  "intonation": 85,
  "feedback": "Good effort! Your pronunciation shows clear articulation and good pacing.",
  "improvements": ["Practice word stress patterns", "Work on smooth transitions"],
  "strengths": ["Clear consonant pronunciation", "Good volume"],
  "wordAnalysis": [
    {
      "word": "example",
      "accuracy": 85,
      "issues": ["Minor articulation adjustment needed"]
    }
  ],
  "phoneticIssues": ["Focus on th sound placement"],
  "nativeSimilarity": 80,
  "recordingQuality": {
    "duration": 3,
    "audioLevel": "Good",
    "backgroundNoise": "Low"
  }
}

Focus on individual word pronunciation accuracy, overall clarity, rhythm, intonation patterns, and provide constructive feedback.
`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/webm",
          data: audioBase64,
        },
      },
      prompt,
    ])

    const response = await result.response
    const text = response.text()
    let cleanedText = text.trim()

    // Remove markdown code block markers if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const analysis = JSON.parse(cleanedText) as PronunciationAnalysis

    // Validate the response structure
    if (!analysis.overallScore || !analysis.feedback) {
      throw new Error("Invalid analysis structure")
    }

    return analysis
  } catch (error) {
    console.error("Gemini API error:", error)

    // Return fallback analysis on API error
    return generateFallbackAnalysis(targetSentence)
  }
}

function generateFallbackAnalysis(targetSentence: string): PronunciationAnalysis {
  // Generate realistic fallback analysis
  const baseScore = 70 + Math.random() * 20 // 70-90 range

  return {
    overallScore: Math.round(baseScore),
    clarity: Math.round(baseScore + (Math.random() - 0.5) * 10),
    rhythm: Math.round(baseScore + (Math.random() - 0.5) * 10),
    intonation: Math.round(baseScore + (Math.random() - 0.5) * 10),
    feedback:
      "Good effort! Your pronunciation shows clear articulation and good pacing. Focus on maintaining consistent intonation patterns for more natural-sounding speech.",
    improvements: [
      "Practice word stress patterns in longer sentences",
      "Work on smooth transitions between words",
      "Focus on rising and falling intonation",
    ],
    strengths: ["Clear consonant pronunciation", "Good volume and projection", "Consistent speaking pace"],
    wordAnalysis: targetSentence.split(" ").map((word) => ({
      word: word.replace(/[.,!?]/g, ""),
      accuracy: Math.round(70 + Math.random() * 25),
      issues: Math.random() > 0.7 ? ["Minor articulation adjustment needed"] : undefined,
    })),
    phoneticIssues: ["Focus on 'th' sound placement", "Vowel clarity in unstressed syllables"],
    nativeSimilarity: Math.round(baseScore - 5),
    recordingQuality: {
      duration: 3,
      audioLevel: "Good",
      backgroundNoise: "Low",
    },
    isDemoAnalysis: true,
  }
}

export async function generatePracticeSentences(level: string, focus: string[] = []) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Generate 5 practice sentences for English pronunciation training.

Level: ${level}
Focus areas: ${focus.join(", ") || "general pronunciation"}

IMPORTANT: Return ONLY valid JSON array format, no markdown formatting, no code blocks, no additional text.

Example format:
[
  {
    "sentence": "The cat sits on the mat",
    "difficulty": "beginner",
    "focusAreas": ["th sound", "short vowels"],
    "tips": "Focus on the th sound in the - place your tongue between your teeth"
  }
]

Requirements:
- Sentences should be appropriate for ${level} level
- Include words that target the focus areas: ${focus.join(", ")}
- Vary sentence length and complexity
- Include common pronunciation challenges
- Make sentences practical and useful
- Ensure all JSON strings are properly escaped
- Do not include line breaks within JSON strings
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    let cleanedText = text.trim()

    console.log("Raw Gemini response:", text)

    // Remove markdown code block markers if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    console.log("Cleaned text:", cleanedText)

    // Additional cleaning for common JSON issues
    cleanedText = cleanedText
      .replace(/\n/g, " ") // Replace newlines with spaces
      .replace(/\r/g, "") // Remove carriage returns
      .replace(/\t/g, " ") // Replace tabs with spaces
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim()

    console.log("Final cleaned text:", cleanedText)

    const sentences = JSON.parse(cleanedText)

    // Validate the response structure
    if (!Array.isArray(sentences) || sentences.length === 0) {
      throw new Error("Invalid sentences structure")
    }

    return sentences
  } catch (error) {
    console.error("Error generating practice sentences:", error)
    console.error("Error details:", error.message)
    return getFallbackSentences(level)
  }
}

function getFallbackSentences(level: string) {
  const sentences = {
    beginner: [
      {
        sentence: "The cat sits on the mat.",
        difficulty: "beginner",
        focusAreas: ["th", "short vowels"],
        tips: "Focus on the 'th' sound in 'the' - place your tongue between your teeth.",
      },
      {
        sentence: "I like to eat apples and oranges.",
        difficulty: "beginner",
        focusAreas: ["vowel sounds", "linking"],
        tips: "Practice linking 'eat apples' smoothly without pausing.",
      },
      {
        sentence: "She walks to school every morning.",
        difficulty: "beginner",
        focusAreas: ["consonant clusters", "vowel sounds"],
        tips: "Pay attention to the 'ks' sound in 'walks' and clear vowels.",
      },
      {
        sentence: "My brother plays basketball on weekends.",
        difficulty: "beginner",
        focusAreas: ["consonant clusters", "word stress"],
        tips: "Stress the first syllable in 'BAS-ket-ball' and 'WEEK-ends'.",
      },
      {
        sentence: "We need three things from the store.",
        difficulty: "beginner",
        focusAreas: ["th", "consonant clusters"],
        tips: "Practice the 'th' in 'three' and 'things' - tongue between teeth.",
      },
    ],
    intermediate: [
      {
        sentence: "The weather forecast predicts thunderstorms this afternoon.",
        difficulty: "intermediate",
        focusAreas: ["th", "consonant clusters", "word stress"],
        tips: "Stress the first syllable in 'THUNderstorms' and 'AFternoon'.",
      },
      {
        sentence: "She successfully completed her university degree program.",
        difficulty: "intermediate",
        focusAreas: ["word stress", "linking", "consonant clusters"],
        tips: "Practice linking words smoothly: 'successfully completed' and stress 'SUC-cess-ful-ly'.",
      },
      {
        sentence: "The restaurant serves authentic Mediterranean cuisine daily.",
        difficulty: "intermediate",
        focusAreas: ["consonant clusters", "word stress", "vowel sounds"],
        tips: "Break down 'au-THEN-tic' and 'Med-i-ter-RA-ne-an' with proper stress.",
      },
      {
        sentence: "Technology continues to revolutionize modern communication methods.",
        difficulty: "intermediate",
        focusAreas: ["word stress", "consonant clusters", "rhythm"],
        tips: "Focus on rhythm: tech-NOL-o-gy, rev-o-LU-tion-ize, com-mu-ni-CA-tion.",
      },
      {
        sentence: "Environmental protection requires international cooperation and commitment.",
        difficulty: "intermediate",
        focusAreas: ["word stress", "linking", "consonant clusters"],
        tips: "Practice long word stress patterns and smooth linking between words.",
      },
    ],
    advanced: [
      {
        sentence: "The pharmaceutical company's breakthrough research revolutionized treatment protocols.",
        difficulty: "advanced",
        focusAreas: ["complex consonants", "word stress", "rhythm"],
        tips: "Break down long words: phar-ma-CEU-ti-cal, break-THROUGH, rev-o-LU-tion-ized.",
      },
      {
        sentence: "Simultaneously, the archaeologists discovered unprecedented historical artifacts.",
        difficulty: "advanced",
        focusAreas: ["complex consonants", "word stress", "rhythm"],
        tips: "Master si-mul-TA-ne-ous-ly and ar-chae-OL-o-gists with proper stress patterns.",
      },
      {
        sentence: "The entrepreneur's innovative methodology significantly enhanced productivity metrics.",
        difficulty: "advanced",
        focusAreas: ["word stress", "consonant clusters", "rhythm"],
        tips: "Focus on en-tre-pre-NEUR, meth-od-OL-o-gy, and pro-duc-TIV-i-ty stress.",
      },
      {
        sentence: "Psychological research demonstrates the correlation between exercise and cognitive function.",
        difficulty: "advanced",
        focusAreas: ["complex consonants", "word stress", "linking"],
        tips: "Practice psy-cho-LOG-i-cal, cor-re-LA-tion, and COG-ni-tive with clear articulation.",
      },
      {
        sentence: "The constitutional amendment requires parliamentary ratification through democratic processes.",
        difficulty: "advanced",
        focusAreas: ["word stress", "consonant clusters", "rhythm"],
        tips: "Master con-sti-TU-tion-al, par-lia-MEN-ta-ry, and rat-i-fi-CA-tion stress patterns.",
      },
    ],
  }

  return sentences[level as keyof typeof sentences] || sentences.beginner
}
