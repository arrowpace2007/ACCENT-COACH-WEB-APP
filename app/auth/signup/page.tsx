"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chrome, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    learningGoal: "",
    currentLevel: "",
    targetAccent: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.learningGoal ||
      !formData.currentLevel ||
      !formData.targetAccent
    ) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        learning_level: formData.currentLevel,
        target_accent: formData.targetAccent,
        learning_goal: formData.learningGoal,
      })

      // Redirect to dashboard after successful signup
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError("")
    setIsLoading(true)

    try {
      await signInWithGoogle()
      // Redirect will be handled by the OAuth flow
    } catch (error: any) {
      setError(error.message || "An error occurred with Google signup")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription>Start your pronunciation improvement journey</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Chrome className="h-5 w-5 mr-2" />}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningGoal">Learning Goal</Label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, learningGoal: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What's your main goal?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional Communication</SelectItem>
                    <SelectItem value="academic">Academic Success</SelectItem>
                    <SelectItem value="social">Social Interaction</SelectItem>
                    <SelectItem value="travel">Travel & Tourism</SelectItem>
                    <SelectItem value="general">General Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentLevel">Current English Level</Label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, currentLevel: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAccent">Target Accent</Label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, targetAccent: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your target accent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="american">American English</SelectItem>
                    <SelectItem value="british">British English</SelectItem>
                    <SelectItem value="australian">Australian English</SelectItem>
                    <SelectItem value="canadian">Canadian English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
