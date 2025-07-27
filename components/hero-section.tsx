"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Mic, Star, Users, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-20 pb-16">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Star className="h-4 w-4" />
            AI-Powered Pronunciation Coach
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Perfect Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              {" "}
              English Accent
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Get instant, personalized feedback on your pronunciation with our advanced AI coach. Speak with confidence
            and clarity in any situation.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              <span>
                <strong className="text-gray-900">10,000+</strong> learners
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              <span>
                <strong className="text-gray-900">Real-time</strong> feedback
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              <span>
                <strong className="text-gray-900">4.9/5</strong> rating
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/practice">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-amber-600 text-amber-700 hover:bg-amber-50 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent"
              >
                <Mic className="mr-2 h-5 w-5" />
                Try Demo
              </Button>
            </Link>
          </div>

          {/* Demo preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-500 font-medium">Accent Coach - Practice Session</span>
              </div>

              <div className="text-left space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-2">Practice Sentence:</p>
                  <p className="text-lg font-medium text-gray-900">"The quick brown fox jumps over the lazy dog."</p>
                </div>

                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Mic className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium text-sm">Analysis Complete</span>
                  </div>
                  <p className="text-green-800 text-sm">Great pronunciation! Your clarity score: 92/100</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
