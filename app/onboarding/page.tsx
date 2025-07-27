"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Play, ArrowRight, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const steps = [
  {
    title: "Welcome to Accent Coach!",
    description: "Let's get you started with a quick introduction to how our AI-powered coaching works.",
    content: "WelcomeStep",
  },
  {
    title: "Your First Practice Session",
    description: "Try recording a sample sentence to see how our AI feedback works.",
    content: "PracticeStep",
  },
  {
    title: "Understanding Your Results",
    description: "Learn how to interpret your pronunciation scores and feedback.",
    content: "ResultsStep",
  },
  {
    title: "Set Your Goals",
    description: "Define your learning objectives and practice schedule.",
    content: "GoalsStep",
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleRecord = async () => {
    setIsRecording(true)
    // Simulate recording
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsRecording(false)
    setHasRecorded(true)

    // Show results after a delay
    setTimeout(() => {
      setShowResults(true)
    }, 1000)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setShowResults(false)
      setHasRecorded(false)
    } else {
      router.push("/dashboard")
    }
  }

  const WelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
        <Mic className="h-10 w-10 text-blue-600" />
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">How Accent Coach Works</h3>
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
              1
            </div>
            <p className="text-gray-700">Record yourself speaking a practice sentence</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
              2
            </div>
            <p className="text-gray-700">Our AI analyzes your pronunciation in real-time</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
              3
            </div>
            <p className="text-gray-700">Get detailed feedback and improvement tips</p>
          </div>
        </div>
      </div>
    </div>
  )

  const PracticeStep = () => (
    <div className="text-center space-y-6">
      <h3 className="text-xl font-semibold">Try Your First Recording</h3>
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-lg font-medium text-gray-900 mb-4">"The quick brown fox jumps over the lazy dog."</p>
        <Button variant="outline" size="sm" className="mb-4 bg-transparent">
          <Play className="h-4 w-4 mr-2" />
          Listen to native pronunciation
        </Button>
      </div>

      <div className="space-y-4">
        <Button
          size="lg"
          className={`rounded-full h-20 w-20 ${isRecording ? "bg-red-600 animate-pulse" : "bg-red-500 hover:bg-red-600"}`}
          onClick={handleRecord}
          disabled={isRecording || hasRecorded}
        >
          {hasRecorded ? <CheckCircle className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </Button>

        <p className="text-sm text-gray-600">
          {isRecording
            ? "Recording... Speak clearly!"
            : hasRecorded
              ? "Great! Processing your recording..."
              : "Click to start recording"}
        </p>
      </div>
    </div>
  )

  const ResultsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-center">Your Pronunciation Analysis</h3>

      {showResults ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Overall Score</span>
              <span className="text-2xl font-bold text-green-600">85/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Clarity</span>
              <span className="font-medium text-green-600">Excellent</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rhythm</span>
              <span className="font-medium text-yellow-600">Good</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Intonation</span>
              <span className="font-medium text-green-600">Very Good</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Improvement Tip</h4>
            <p className="text-blue-800 text-sm">
              Focus on the 'th' sound in "the". Try placing your tongue between your teeth for a clearer pronunciation.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your pronunciation...</p>
        </div>
      )}
    </div>
  )

  const GoalsStep = () => (
    <div className="text-center space-y-6">
      <h3 className="text-xl font-semibold">You're All Set!</h3>
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Your Learning Plan</h4>
            <div className="text-left space-y-2 text-sm text-gray-700">
              <p>• Daily practice goal: 10 minutes</p>
              <p>• Focus area: Professional communication</p>
              <p>• Target: Improve clarity and confidence</p>
            </div>
          </div>
          <p className="text-gray-600">
            Ready to start your pronunciation improvement journey? Let's go to your dashboard!
          </p>
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (steps[currentStep].content) {
      case "WelcomeStep":
        return <WelcomeStep />
      case "PracticeStep":
        return <PracticeStep />
      case "ResultsStep":
        return <ResultsStep />
      case "GoalsStep":
        return <GoalsStep />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600 mt-2">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <CardTitle className="text-2xl font-bold">{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {renderStepContent()}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <Button onClick={nextStep} disabled={currentStep === 1 && !hasRecorded}>
                {currentStep === steps.length - 1 ? "Go to Dashboard" : "Next"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
