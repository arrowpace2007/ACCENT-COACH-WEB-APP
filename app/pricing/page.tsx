"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Star, Crown, Zap, ArrowLeft } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for getting started",
    features: [
      "3 practice sessions per day",
      "Basic pronunciation scoring",
      "Limited feedback detail",
      "Access to starter content library",
      "Community support",
    ],
    limitations: [
      "No session history access",
      "No progress tracking charts",
      "Basic feedback without detailed recommendations",
      "Limited practice content variety",
    ],
    cta: "Current Plan",
    popular: false,
    color: "gray",
  },
  {
    name: "Pro",
    monthlyPrice: 6.99,
    yearlyPrice: 55.92, // 20% discount
    description: "For serious learners and working professionals",
    features: [
      "Unlimited practice sessions",
      "Complete session history and analytics",
      "Detailed AI-generated feedback with specific improvement tips",
      "Access to all practice modes and themed playlists",
      "Priority customer support",
      "Progress tracking with interactive charts",
      "Daily challenges and gamification",
      "Export progress reports",
    ],
    cta: "Start Free Trial",
    popular: true,
    color: "blue",
  },
  {
    name: "Premium",
    monthlyPrice: 14.99,
    yearlyPrice: 119.92, // 20% discount
    description: "For advanced users and professional development",
    features: [
      "Everything in Pro Plan",
      "Weekly personalized coaching reports",
      "Advanced analytics with trend analysis",
      "Early access to new features and content",
      "Custom practice content upload capability",
      "Monthly group coaching sessions",
      "1-on-1 expert feedback sessions",
      "API access for integrations",
      "White-label options for organizations",
    ],
    cta: "Start Free Trial",
    popular: false,
    color: "purple",
  },
]

const faqs = [
  {
    question: "How does the free trial work?",
    answer:
      "All paid plans include a 7-day free trial with full access to premium features. You can cancel anytime during the trial period without being charged.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe.",
  },
  {
    question: "Is there a student discount?",
    answer:
      "Yes! Students with a valid .edu email address receive 50% off all paid plans. Contact support with your student ID for verification.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not satisfied with your subscription, contact us for a full refund.",
  },
  {
    question: "Can I use Accent Coach offline?",
    answer:
      "Basic practice content can be downloaded for offline use with Pro and Premium plans. However, AI analysis requires an internet connection.",
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("pro")

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName.toLowerCase())
    // In a real app, this would redirect to checkout
    console.log(`Selected plan: ${planName}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Pricing Plans</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose the Perfect Plan for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Your Learning Journey
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free and upgrade as you progress. All paid plans include a 7-day free trial with full access to
            premium features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? "text-gray-900" : "text-gray-500"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-blue-600" />
            <span className={`text-sm font-medium ${isYearly ? "text-gray-900" : "text-gray-500"}`}>Yearly</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Save 20%
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-blue-500 shadow-xl scale-105 bg-gradient-to-br from-blue-50 to-white"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <div className="flex justify-center mb-4">
                  <div
                    className={`rounded-full p-3 ${
                      plan.color === "blue" ? "bg-blue-100" : plan.color === "purple" ? "bg-purple-100" : "bg-gray-100"
                    }`}
                  >
                    {plan.color === "blue" ? (
                      <Zap className="h-8 w-8 text-blue-600" />
                    ) : plan.color === "purple" ? (
                      <Crown className="h-8 w-8 text-purple-600" />
                    ) : (
                      <Star className="h-8 w-8 text-gray-600" />
                    )}
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>

                <div className="mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${isYearly ? (plan.yearlyPrice / 12).toFixed(2) : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="line-through">${plan.monthlyPrice}/month</span>
                      <span className="text-green-600 ml-2 font-medium">Save 20%</span>
                    </div>
                  )}
                  {isYearly && plan.monthlyPrice > 0 && (
                    <div className="text-xs text-gray-500 mt-1">Billed annually (${plan.yearlyPrice}/year)</div>
                  )}
                </div>

                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : plan.name === "Free"
                        ? "bg-gray-600 hover:bg-gray-700"
                        : ""
                  }`}
                  variant={plan.popular ? "default" : plan.name === "Free" ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan.name)}
                  disabled={plan.name === "Free"}
                >
                  {plan.cta}
                </Button>

                {plan.name !== "Free" && (
                  <p className="text-xs text-gray-500 text-center">7-day free trial • Cancel anytime • No setup fees</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enterprise Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-white text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Enterprise Solutions</h3>
            <p className="text-gray-300 text-lg mb-8">
              Custom solutions for organizations, schools, and corporate training programs. Get volume discounts,
              dedicated support, and advanced admin features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 bg-transparent">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">{faq.question}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Pronunciation?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who have already improved their English pronunciation with our AI-powered
            coaching platform.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Start Your Free Trial Today
          </Button>
        </div>
      </div>
    </div>
  )
}
