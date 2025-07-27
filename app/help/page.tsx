"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  BookOpen,
  MessageCircle,
  Video,
  ChevronRight,
  Star,
  Clock,
  Users,
  HelpCircle,
  Lightbulb,
  Settings,
  CreditCard,
  Smartphone,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const helpCategories = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn the basics of using Accent Coach",
    articles: 12,
    color: "from-blue-500 to-blue-600",
    topics: ["Account Setup", "First Recording", "Understanding Scores", "Practice Tips"],
  },
  {
    icon: Settings,
    title: "Account & Settings",
    description: "Manage your profile and preferences",
    articles: 8,
    color: "from-green-500 to-green-600",
    topics: ["Profile Settings", "Privacy Controls", "Notifications", "Data Export"],
  },
  {
    icon: CreditCard,
    title: "Billing & Subscriptions",
    description: "Payment, plans, and billing questions",
    articles: 6,
    color: "from-purple-500 to-purple-600",
    topics: ["Upgrade Plans", "Payment Methods", "Refunds", "Invoices"],
  },
  {
    icon: Smartphone,
    title: "Technical Support",
    description: "Troubleshooting and technical issues",
    articles: 15,
    color: "from-orange-500 to-orange-600",
    topics: ["Microphone Issues", "Browser Compatibility", "Audio Problems", "Performance"],
  },
]

const popularArticles = [
  {
    title: "How to Set Up Your Microphone for Best Results",
    category: "Technical Support",
    readTime: "3 min read",
    views: "2.1k views",
    rating: 4.8,
  },
  {
    title: "Understanding Your Pronunciation Scores",
    category: "Getting Started",
    readTime: "5 min read",
    views: "1.8k views",
    rating: 4.9,
  },
  {
    title: "Upgrading to Pro: What You Get",
    category: "Billing & Subscriptions",
    readTime: "2 min read",
    views: "1.5k views",
    rating: 4.7,
  },
  {
    title: "Best Practices for Daily Practice",
    category: "Getting Started",
    readTime: "4 min read",
    views: "1.3k views",
    rating: 4.8,
  },
]

const quickLinks = [
  { title: "Contact Support", href: "/contact", icon: MessageCircle },
  { title: "Video Tutorials", href: "/tutorials", icon: Video },
  { title: "System Status", href: "/status", icon: Settings },
  { title: "Feature Requests", href: "/feedback", icon: Lightbulb },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <Header />

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-amber-200/20 to-orange-200/15 rounded-full blur-3xl animate-float-gentle"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 mb-6">
              Help Center
            </Badge>

            <h1 className="text-heading text-5xl lg:text-7xl text-slate-900 mb-6">
              How Can We
              <span className="block text-golden-gradient mt-2">Help You?</span>
            </h1>

            <p className="text-xl text-body max-w-3xl mx-auto leading-relaxed mb-8">
              Find answers to common questions, learn how to use Accent Coach effectively, and get the support you need
              to succeed.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search for help articles, tutorials, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg glass-refined border-amber-200 focus:border-amber-400 rounded-xl"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-amber-600 to-amber-700">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link, index) => (
              <Button key={index} variant="outline" asChild className="glass-refined hover-glow-soft bg-transparent">
                <Link href={link.href} className="flex items-center gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-heading text-4xl text-slate-900 mb-6">Browse by Category</h2>
            <p className="text-xl text-body max-w-3xl mx-auto">Find the information you need organized by topic.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {helpCategories.map((category, index) => (
              <Card key={index} className="glass-card-elegant hover-lift-subtle cursor-pointer group">
                <CardContent className="p-8">
                  <div
                    className={`bg-gradient-to-r ${category.color} rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <category.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-amber-700 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-body mb-4">{category.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      {category.articles} articles
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  </div>

                  <div className="space-y-1">
                    {category.topics.map((topic, topicIndex) => (
                      <p key={topicIndex} className="text-sm text-slate-600 hover:text-amber-600 cursor-pointer">
                        • {topic}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-amber-50/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-heading text-4xl text-slate-900 mb-6">Popular Articles</h2>
            <p className="text-xl text-body max-w-3xl mx-auto">
              The most helpful articles based on user ratings and views.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {popularArticles.map((article, index) => (
              <Card key={index} className="glass-card-elegant hover-lift-subtle cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                      {article.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-amber-400" />
                      <span className="text-sm text-slate-600">{article.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-3 group-hover:text-amber-700 transition-colors">
                    {article.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {article.views}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="glass-refined bg-transparent">
              View All Articles
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-heading text-4xl text-slate-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-body max-w-3xl mx-auto">
              Quick answers to the most common questions about Accent Coach.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "How does the AI pronunciation analysis work?",
                answer:
                  "Our AI uses advanced speech recognition and phonetic analysis to evaluate your pronunciation. It compares your speech patterns to native speaker models and provides detailed feedback on clarity, rhythm, and intonation.",
              },
              {
                question: "Can I use Accent Coach without an internet connection?",
                answer:
                  "Currently, Accent Coach requires an internet connection for AI analysis. However, you can download practice content for offline review, and we're working on offline capabilities for future releases.",
              },
              {
                question: "What languages and accents does Accent Coach support?",
                answer:
                  "We currently focus on helping learners achieve clear American English pronunciation. We're expanding to support British English, Australian English, and other variants based on user demand.",
              },
              {
                question: "Is there a limit to how much I can practice?",
                answer:
                  "Free users get 3 practice sessions per day. Pro and Premium users have unlimited practice sessions. All users can access basic feedback and progress tracking.",
              },
              {
                question: "How secure is my voice data?",
                answer:
                  "We take privacy seriously. Voice recordings are encrypted during transmission and processing. We don't store your voice data permanently - it's only used for analysis and then deleted.",
              },
            ].map((faq, index) => (
              <Card key={index} className="glass-card-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 rounded-full p-2 mt-1">
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">{faq.question}</h3>
                      <p className="text-body leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-heading text-4xl mb-6">Still Need Help?</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Can't find what you're looking for? Our support team is here to help you succeed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              <Link href="/contact">
                <MessageCircle className="h-5 w-5 mr-2" />
                Contact Support
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/tutorials">
                <Video className="h-5 w-5 mr-2" />
                Watch Tutorials
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
