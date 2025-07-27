"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Brain, TrendingUp, Play, ArrowRight, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"

const steps = [
  {
    step: "01",
    icon: Mic,
    title: "Record Your Voice",
    description:
      "Simply click record and speak any sentence. Our advanced microphone captures every nuance of your pronunciation with crystal-clear quality.",
    color: "from-red-500 to-pink-500",
    bgColor: "from-red-50 to-pink-50",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Analysis",
    description:
      "Our cutting-edge AI powered by OpenAI Whisper analyzes your speech patterns, identifying areas for improvement with scientific precision.",
    color: "from-blue-500 to-purple-500",
    bgColor: "from-blue-50 to-purple-50",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Get Feedback & Improve",
    description:
      "Receive detailed, personalized feedback with specific tips and track your progress as you master perfect English pronunciation.",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
  },
]

export function HowItWorksSection() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            steps.forEach((_, index) => {
              setTimeout(() => {
                setVisibleSteps((prev) => [...prev, index])
              }, index * 400)
            })
          }
        })
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-32 bg-gradient-to-br from-gray-50 via-white to-amber-50/20 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-r from-amber-200/30 to-yellow-200/30 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-orange-200/20 to-red-200/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-6 py-3 rounded-full mb-6">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <span className="text-amber-700 font-semibold">How It Works</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Master Pronunciation in
            <span className="block text-golden mt-2">3 Simple Steps</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our revolutionary AI-powered system makes improving your English pronunciation
            <span className="text-golden font-semibold"> effortless and effective</span>
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative mb-16 last:mb-0">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-32 w-px h-32 bg-gradient-to-b from-amber-300 to-transparent transform -translate-x-1/2 hidden lg:block"></div>
              )}

              <div
                className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
              >
                {/* Content */}
                <div
                  className={`space-y-6 ${visibleSteps.includes(index) ? "animate-slide-in-left" : "opacity-0"} ${index % 2 === 1 ? "lg:col-start-2" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`bg-gradient-to-r ${step.color} text-white text-2xl font-bold w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      {step.step}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-300 to-transparent"></div>
                  </div>

                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">{step.title}</h3>

                  <p className="text-xl text-gray-600 leading-relaxed">{step.description}</p>

                  {index === 0 && (
                    <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl hover-lift">
                      <Play className="h-5 w-5 mr-2" />
                      Try Recording Now
                    </Button>
                  )}
                </div>

                {/* Visual */}
                <div
                  className={`${visibleSteps.includes(index) ? "animate-slide-in-right" : "opacity-0"} ${index % 2 === 1 ? "lg:col-start-1" : ""}`}
                >
                  <Card className={`glass-card border-0 shadow-2xl hover-lift bg-gradient-to-br ${step.bgColor}`}>
                    <CardContent className="p-12 text-center">
                      <div className="relative">
                        <div
                          className={`bg-gradient-to-r ${step.color} rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse-glow`}
                        >
                          <step.icon className="h-12 w-12 text-white" />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-60 animate-bounce"></div>
                        <div
                          className="absolute -bottom-4 -left-4 w-6 h-6 bg-amber-400 rounded-full opacity-40 animate-bounce"
                          style={{ animationDelay: "0.5s" }}
                        ></div>

                        {/* Step-specific animations */}
                        {index === 0 && (
                          <div className="flex justify-center gap-2 mt-6">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-2 bg-gradient-to-t from-red-400 to-pink-400 rounded-full animate-wave"
                                style={{
                                  height: `${20 + Math.random() * 20}px`,
                                  animationDelay: `${i * 0.2}s`,
                                }}
                              ></div>
                            ))}
                          </div>
                        )}

                        {index === 1 && (
                          <div className="mt-6">
                            <div className="flex justify-center gap-3">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"
                                  style={{ animationDelay: `${i * 0.3}s` }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        )}

                        {index === 2 && (
                          <div className="mt-6">
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4">
                              <div className="text-2xl font-bold text-green-600 mb-1">95</div>
                              <div className="text-sm text-green-700">Pronunciation Score</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover-lift text-lg"
          >
            <Link href="/auth/signup">
              Start Your Journey Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
