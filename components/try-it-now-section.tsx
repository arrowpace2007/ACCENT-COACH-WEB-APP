"use client"

import { Button } from "@/components/ui/button"
import { Play, Star, Users, Sparkles, ArrowUp } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export function TryItNowSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("try-it-now-section")
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToRecording = () => {
    const heroSection = document.querySelector(".hero-recording-section")
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <section
      id="try-it-now-section"
      className="relative py-24 overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50/30 to-indigo-50/20"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-blue-200/15 rounded-full blur-3xl animate-float-gentle"></div>
        <div
          className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-indigo-200/15 to-purple-200/20 rounded-full blur-3xl animate-float-gentle"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={`space-y-8 ${isVisible ? "animate-slide-up-smooth" : "opacity-0"}`}>
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 glass-refined px-4 py-2 rounded-full border border-purple-200">
                <div className="relative">
                  <Sparkles className="h-5 w-5 fill-current text-purple-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm font-semibold text-purple-800 tracking-wide">Experience the Difference</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-heading">
                <span className="block text-4xl lg:text-6xl text-slate-900 mb-3">Ready to</span>
                <span className="block text-4xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 mb-4">
                  Transform Your Voice?
                </span>
                <span className="block text-xl lg:text-2xl font-normal text-slate-600 font-sans">
                  See how our AI coaching works in real-time
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg lg:text-xl text-body max-w-2xl leading-relaxed">
                Don't just take our word for it. Experience the power of AI-driven pronunciation coaching yourself.
                <span className="font-semibold text-purple-700"> Try our demo</span> and see instant results.
              </p>

              {/* Stats */}
              <div className="flex items-center gap-8 py-4">
                <div className="flex items-center gap-3">
                  <div className="glass-refined p-2 rounded-full border border-purple-200">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">98%</div>
                    <div className="text-sm text-slate-600">Success rate</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current text-purple-400" />
                    ))}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Instant</div>
                    <div className="text-sm text-slate-600">AI feedback</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={scrollToRecording}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover-lift-subtle text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="glass-refined hover-glow-soft border-purple-200 text-purple-800 font-semibold px-8 py-4 rounded-xl text-lg hover-lift-subtle bg-transparent"
                asChild
              >
                <Link href="/auth/signup">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>No installation required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Works in your browser</span>
              </div>
            </div>
          </div>

          {/* Right Side - Demo Preview */}
          <div
            className={`relative ${isVisible ? "animate-fade-in-scale" : "opacity-0"}`}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="glass-card-elegant rounded-3xl p-12 hover-lift-subtle border border-purple-100">
              <div className="text-center space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-4">See It In Action</h3>
                  <div className="glass-refined rounded-2xl p-6 mb-6 border border-purple-200">
                    <p className="text-xl font-medium text-slate-800 leading-relaxed mb-4">
                      "Practice makes perfect, and perfect practice makes champions."
                    </p>
                    <div className="flex justify-center">
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 inline-block">
                        <div className="text-2xl font-bold text-green-600 mb-1">92</div>
                        <div className="text-sm text-green-700">Sample Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demo Button */}
                <Button
                  onClick={scrollToRecording}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full h-20 w-20 shadow-xl hover-lift-subtle"
                >
                  <ArrowUp className="h-8 w-8 text-white" />
                </Button>

                <div className="text-center space-y-3">
                  <p className="text-purple-700 font-medium">Click to try the recording demo above</p>
                  <div className="glass-refined px-4 py-2 rounded-full inline-block border border-purple-200">
                    <span className="text-purple-700 font-semibold text-sm">✨ Interactive Demo Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
