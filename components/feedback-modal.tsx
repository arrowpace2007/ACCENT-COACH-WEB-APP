"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, TrendingUp, Volume2, Target, Award } from "lucide-react"

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

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  analysis: PronunciationAnalysis
  targetSentence: string
}

export default function FeedbackModal({ isOpen, onClose, analysis, targetSentence }: FeedbackModalProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Award className="w-6 h-6" />
            Pronunciation Analysis Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Demo Analysis Notice */}
          {analysis.isDemoAnalysis && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Demo Analysis</span>
              </div>
              <p className="text-blue-700 mt-1">
                This is a demonstration analysis. For real-time pronunciation feedback, ensure your Gemini API is
                properly configured.
              </p>
            </div>
          )}

          {/* Target Sentence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Target Sentence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium bg-gray-50 p-3 rounded-lg">"{targetSentence}"</p>
            </CardContent>
          </Card>

          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold">
                  <span className={getScoreColor(analysis.overallScore)}>{analysis.overallScore}</span>
                  <span className="text-gray-500">/100</span>
                </span>
                <Badge variant={getScoreBadgeVariant(analysis.overallScore)} className="text-lg px-3 py-1">
                  {analysis.overallScore >= 80 ? "Excellent" : analysis.overallScore >= 60 ? "Good" : "Needs Practice"}
                </Badge>
              </div>
              <Progress value={analysis.overallScore} className="h-3" />
            </CardContent>
          </Card>

          {/* Detailed Scores */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Clarity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  <span className={getScoreColor(analysis.clarity)}>{analysis.clarity}</span>
                  <span className="text-gray-500 text-base">/100</span>
                </div>
                <Progress value={analysis.clarity} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Rhythm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  <span className={getScoreColor(analysis.rhythm)}>{analysis.rhythm}</span>
                  <span className="text-gray-500 text-base">/100</span>
                </div>
                <Progress value={analysis.rhythm} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Intonation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  <span className={getScoreColor(analysis.intonation)}>{analysis.intonation}</span>
                  <span className="text-gray-500 text-base">/100</span>
                </div>
                <Progress value={analysis.intonation} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Detailed Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{analysis.feedback}</p>
            </CardContent>
          </Card>

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="w-5 h-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Word Analysis */}
          {analysis.wordAnalysis && analysis.wordAnalysis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Word-by-Word Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {analysis.wordAnalysis.map((wordData, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-lg">"{wordData.word}"</span>
                        <Badge variant={getScoreBadgeVariant(wordData.accuracy)}>{wordData.accuracy}%</Badge>
                      </div>
                      {wordData.issues && wordData.issues.length > 0 && (
                        <div className="text-sm text-gray-600">{wordData.issues.join(", ")}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recording Quality */}
          <Card>
            <CardHeader>
              <CardTitle>Recording Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{analysis.recordingQuality.duration}s</div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    <Badge variant="outline">{analysis.recordingQuality.audioLevel}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">Audio Level</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    <Badge variant="outline">{analysis.recordingQuality.backgroundNoise}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">Background Noise</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={onClose} size="lg">
              Practice More
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
