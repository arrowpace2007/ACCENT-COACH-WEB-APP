"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Crown, Zap } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "3 practice sessions per day",
      "Basic pronunciation scoring",
      "Limited feedback detail",
      "Access to starter content",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/auth/signup",
    popular: false,
    icon: Star,
  },
  {
    name: "Pro",
    price: "$6.99",
    period: "per month",
    description: "For serious learners",
    features: [
      "Unlimited practice sessions",
      "Complete session history",
      "Detailed AI feedback",
      "All practice modes",
      "Progress tracking charts",
      "Priority support",
      "Themed playlists",
    ],
    cta: "Start Pro Trial",
    href: "/auth/signup?plan=pro",
    popular: true,
    icon: Zap,
  },
  {
    name: "Premium",
    price: "$14.99",
    period: "per month",
    description: "For advanced users",
    features: [
      "Everything in Pro",
      "Weekly coaching reports",
      "Advanced analytics",
      "Early access to features",
      "Custom content upload",
      "Monthly group sessions",
      "1-on-1 expert feedback",
    ],
    cta: "Start Premium Trial",
    href: "/auth/signup?plan=premium",
    popular: false,
    icon: Crown,
  },
]

export function PricingSection() {
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
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-r from-amber-200/10 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-200/10 to-amber-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative">
        <div className={`text-center mb-16 ${isVisible ? "animate-slide-up-smooth" : "opacity-0"}`}>
          <div className="inline-flex items-center gap-2 glass-golden-subtle px-4 py-2 rounded-full mb-6">
            <Crown className="h-5 w-5 text-amber-600" />
            <span className="text-amber-800 font-semibold text-sm">Pricing Plans</span>
          </div>

          <h2 className="text-heading text-4xl lg:text-6xl text-slate-900 mb-6">
            Choose Your Perfect
            <span className="block text-golden-gradient mt-2">Learning Plan</span>
          </h2>

          <p className="text-xl text-body max-w-3xl mx-auto">
            Start free and upgrade as you progress. All paid plans include a{" "}
            <span className="text-amber-700 font-semibold">7-day free trial</span> with full access to premium features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-700 hover-lift-subtle ${
                plan.popular
                  ? "glass-card-elegant border-2 border-amber-200 shadow-2xl scale-105"
                  : "glass-refined border border-slate-200 shadow-lg"
              } ${isVisible ? "animate-slide-up-smooth" : "opacity-0 translate-y-8"}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                    <Star className="h-4 w-4 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-6 pt-8">
                <div className="flex justify-center mb-4">
                  <div
                    className={`rounded-xl p-3 ${
                      plan.popular
                        ? "bg-gradient-to-r from-amber-500 to-amber-600"
                        : "bg-gradient-to-r from-slate-500 to-slate-600"
                    }`}
                  >
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</CardTitle>

                <div className="mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                </div>

                <p className="text-slate-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                      : "bg-slate-600 hover:bg-slate-700"
                  } text-white font-semibold py-3 rounded-xl shadow-lg hover-lift-subtle`}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>

                {plan.name !== "Free" && (
                  <p className="text-xs text-slate-500 text-center">7-day free trial • Cancel anytime</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">Need a custom plan for your organization?</p>
          <Button
            variant="outline"
            className="glass-refined hover-glow-soft border-amber-200 text-amber-800 bg-transparent"
            asChild
          >
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
