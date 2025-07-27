"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Mic, Brain, TrendingUp, Target, Clock, Award, Zap } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const features = [
  {
    icon: Mic,
    title: "Advanced Voice Analysis",
    description:
      "Powered by OpenAI Whisper for precise pronunciation assessment with real-time feedback and detailed scoring.",
    color: "from-blue-500 to-blue-600",
    delay: "0s",
  },
  {
    icon: Brain,
    title: "Intelligent AI Feedback",
    description:
      "Get personalized insights on clarity, rhythm, intonation, and stress patterns with actionable improvement tips.",
    color: "from-purple-500 to-purple-600",
    delay: "0.1s",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your improvement with detailed analytics, interactive charts, and milestone celebrations.",
    color: "from-green-500 to-green-600",
    delay: "0.2s",
  },
  {
    icon: Target,
    title: "Targeted Practice",
    description: "Focus on specific sounds, words, or phrases with personalized learning paths tailored to your needs.",
    color: "from-orange-500 to-orange-600",
    delay: "0.3s",
  },
  {
    icon: Clock,
    title: "Daily Challenges",
    description: "Stay motivated with engaging daily challenges, themed content, and streak rewards.",
    color: "from-amber-500 to-amber-600",
    delay: "0.4s",
  },
  {
    icon: Award,
    title: "Achievement System",
    description: "Earn badges, unlock rewards, and track your learning journey with gamified progress.",
    color: "from-indigo-500 to-indigo-600",
    delay: "0.5s",
  },
]

export function FeaturesSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            features.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards((prev) => [...prev, index])
              }, index * 150)
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/30 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-r from-amber-200/15 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-200/10 to-amber-200/15 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16 scroll-reveal">
          <div className="inline-flex items-center gap-2 glass-golden-subtle px-4 py-2 rounded-full mb-6">
            <Zap className="h-5 w-5 text-amber-600" />
            <span className="text-amber-800 font-semibold text-sm">Powerful Features</span>
          </div>

          <h2 className="text-heading text-4xl lg:text-6xl text-slate-900 mb-6">
            Everything You Need for
            <span className="block text-golden-gradient mt-2">Perfect Pronunciation</span>
          </h2>

          <p className="text-xl text-body max-w-3xl mx-auto">
            Our AI-powered platform combines cutting-edge technology with proven language learning methods to help you
            achieve <span className="text-amber-700 font-semibold">native-like pronunciation</span> efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group border-0 shadow-lg hover-lift-subtle glass-card-elegant transition-all duration-700 ${
                visibleCards.includes(index) ? "animate-slide-up-smooth" : "opacity-0 translate-y-8"
              }`}
              style={{ animationDelay: feature.delay }}
            >
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="relative">
                    <div
                      className={`bg-gradient-to-r ${feature.color} rounded-xl w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-amber-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-body leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { number: "5K+", label: "Active Learners", icon: "👥" },
            { number: "100K+", label: "Practice Sessions", icon: "🎤" },
            { number: "98%", label: "Improvement Rate", icon: "📈" },
            { number: "4.8★", label: "User Rating", icon: "⭐" },
          ].map((stat, index) => (
            <div
              key={index}
              className={`text-center group hover-lift-subtle scroll-reveal ${
                visibleCards.includes(index) ? "revealed" : ""
              }`}
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
            >
              <div className="glass-golden-subtle rounded-xl p-6 hover-glow-soft">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-golden-gradient mb-1">{stat.number}</div>
                <div className="text-slate-600 font-medium text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
