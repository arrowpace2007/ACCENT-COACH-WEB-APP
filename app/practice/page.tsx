"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Volume2, Target } from "lucide-react"
import VoiceRecorder from "@/components/voice-recorder"
import FeedbackModal from "@/components/feedback-modal"

interface PracticeSentence {
  sentence: string
  difficulty: string
  focusAreas: string[]
  tips: string
}

interface PronunciationAnalysis {
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

export default function PracticePage() {
  const [sentences, setSentences] = useState<PracticeSentence[]>([])
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [difficulty, setDifficulty] = useState("beginner")
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const loadPracticeSentences = async (level: string) => {
    try {
      setIsLoading(true)
      console.log("Loading practice sentences for level:", level)

      const response = await fetch("/api/practice-sentences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ level }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received sentences:", data)

      if (data.sentences && Array.isArray(data.sentences)) {
        setSentences(data.sentences)
        setCurrentSentenceIndex(0)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error loading practice sentences:", error)
      // Use fallback sentences
      const fallbackSentences = getFallbackSentences(level)
      setSentences(fallbackSentences)
      setCurrentSentenceIndex(0)
    } finally {
      setIsLoading(false)
    }
  }

  const getFallbackSentences = (level: string): PracticeSentence[] => {
    const fallback = {
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

    return fallback[level as keyof typeof fallback] || fallback.beginner
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setIsAnalyzing(true)
      console.log("Processing audio recording...")

      const currentSentence = sentences[currentSentenceIndex]
      if (!currentSentence) {
        throw new Error("No current sentence available")
      }

      // Create form data for the API request
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")
      formData.append("targetSentence", currentSentence.sentence)

      console.log("Sending audio for analysis...")
      const response = await fetch("/api/analyze-audio", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("Analysis result:", data)

      if (data.analysis) {
        setAnalysis(data.analysis)
        setShowFeedback(true)
      } else {
        throw new Error("Invalid analysis response")
      }
    } catch (error) {
      console.error("Error analyzing audio:", error)

      // Provide fallback analysis
      const fallbackAnalysis: PronunciationAnalysis = {
        overallScore: 75,
        clarity: 80,
        rhythm: 70,
        intonation: 75,
        feedback: `Great effort practicing "${sentences[currentSentenceIndex]?.sentence}"! Your pronunciation shows good clarity and effort. Keep practicing to improve your fluency and confidence.`,
        improvements: [
          "Focus on word stress patterns",
          "Practice connecting words smoothly",
          "Work on consistent volume",
        ],
        strengths: ["Clear articulation of most words", "Good effort and confidence", "Appropriate pacing"],
        wordAnalysis:
          sentences[currentSentenceIndex]?.sentence.split(" ").map((word) => ({
            word: word.replace(/[.,!?]/g, ""),
            accuracy: Math.round(70 + Math.random() * 25),
            issues: Math.random() > 0.7 ? ["Minor articulation adjustment needed"] : undefined,
          })) || [],
        phoneticIssues: ["Focus on 'th' sound placement", "Vowel clarity in unstressed syllables"],
        nativeSimilarity: 72,
        recordingQuality: {
          duration: 3,
          audioLevel: "Good",
          backgroundNoise: "Low",
        },
        isDemoAnalysis: true,
      }

      setAnalysis(fallbackAnalysis)
      setShowFeedback(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const nextSentence = () => {
    setCurrentSentenceIndex((prev) => (prev + 1) % sentences.length)
    setAnalysis(null)
  }

  const previousSentence = () => {
    setCurrentSentenceIndex((prev) => (prev - 1 + sentences.length) % sentences.length)
    setAnalysis(null)
  }

  const handleDifficultyChange = (newDifficulty: string) => {
    setDifficulty(newDifficulty)
    loadPracticeSentences(newDifficulty)
  }

  useEffect(() => {
    loadPracticeSentences(difficulty)
  }, [])

  const currentSentence = sentences[currentSentenceIndex]

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Loading Practice Sentences...</h2>
            <p className="text-gray-600">Preparing your pronunciation practice session</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Pronunciation Practice</h1>
          <p className="text-xl text-gray-600">Practice your English pronunciation with AI-powered feedback</p>
        </div>

        {/* Difficulty Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Practice Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label htmlFor="difficulty" className="font-medium">
                Difficulty Level:
              </label>
              <Select value={difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => loadPracticeSentences(difficulty)} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                New Sentences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Sentence */}
        {currentSentence && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Sentence {currentSentenceIndex + 1} of {sentences.length}
                </span>
                <Badge variant="outline" className="capitalize">
                  {currentSentence.difficulty}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-medium mb-4 p-4 bg-gray-50 rounded-lg">"{currentSentence.sentence}"</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Focus Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentSentence.focusAreas.map((area, index) => (
                      <Badge key={index} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pronunciation Tip:</h4>
                  <p className="text-sm text-gray-600">{currentSentence.tips}</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={previousSentence} variant="outline">
                  Previous
                </Button>
                <Button onClick={nextSentence} variant="outline">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voice Recorder */}
        {currentSentence && (
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            targetSentence={currentSentence.sentence}
            isAnalyzing={isAnalyzing}
            enableRealTime={true}
          />
        )}

        {/* Feedback Modal */}
        {analysis && (
          <FeedbackModal
            isOpen={showFeedback}
            onClose={() => setShowFeedback(false)}
            analysis={analysis}
            targetSentence={currentSentence?.sentence || ""}
          />
        )}
      </div>
    </div>
  )
}
