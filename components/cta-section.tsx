"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Star, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"

export function CTASection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-r from-amber-500/20 to-orange-500/15 rounded-full blur-3xl animate-float-gentle"></div>
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-yellow-500/15 to-amber-500/20 rounded-full blur-3xl animate-float-gentle"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 text-center relative">
        <div className={`max-w-4xl mx-auto space-y-12 ${isVisible ? "animate-slide-up-smooth" : "opacity-0"}`}>
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-full p-6 shadow-2xl animate-pulse-soft">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full p-2 animate-bounce">
                <Star className="h-4 w-4 text-white fill-current" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <h2 className="text-heading text-4xl lg:text-6xl font-bold leading-tight">
              Ready to Transform Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 animate-golden-glow mt-4">
                English Pronunciation?
              </span>
            </h2>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Join <span className="text-amber-400 font-bold">5,000+ learners</span> who have already transformed their
              confidence and communication skills. Start your free trial today and experience the power of AI-driven
              pronunciation coaching.
            </p>
          </div>

          {/* Features highlight */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Zap, text: "Instant AI Feedback", subtext: "Get results in seconds" },
              { icon: Star, text: "Proven Results", subtext: "98% success rate" },
              { icon: Sparkles, text: "7-Day Free Trial", subtext: "No credit card required" },
            ].map((feature, index) => (
              <div key={index} className="glass-golden-subtle rounded-xl p-6 hover-lift-subtle">
                <feature.icon className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                <div className="font-semibold text-white mb-1">{feature.text}</div>
                <div className="text-sm text-slate-300">{feature.subtext}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-12 py-6 rounded-xl shadow-2xl hover-lift-subtle text-xl animate-pulse-soft"
            >
              <Link href="/auth/signup">
                <Sparkles className="h-6 w-6 mr-3" />
                Start Your Free Trial
                <ArrowRight className="h-6 w-6 ml-3" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="glass-refined border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-6 rounded-xl text-lg hover-lift-subtle bg-transparent"
              asChild
            >
              <Link href="/demo">Watch Demo First</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-300 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
