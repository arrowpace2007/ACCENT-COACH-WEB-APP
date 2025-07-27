"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Award, Globe, Heart, Lightbulb, ArrowRight, Linkedin, Twitter, Mail } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

const teamMembers = [
  {
    name: "Dr. Sarah Chen",
    role: "CEO & Co-founder",
    bio: "Former Google AI researcher with 10+ years in speech recognition technology. PhD in Computational Linguistics from Stanford.",
    image: "👩‍💼",
    linkedin: "#",
    twitter: "#",
    email: "sarah@accentcoach.ai",
  },
  {
    name: "Michael Rodriguez",
    role: "CTO & Co-founder",
    bio: "Ex-Amazon Alexa engineer specializing in real-time audio processing. MS Computer Science from MIT.",
    image: "👨‍💻",
    linkedin: "#",
    twitter: "#",
    email: "michael@accentcoach.ai",
  },
  {
    name: "Dr. Emily Watson",
    role: "Head of Linguistics",
    bio: "ESL expert with 15+ years teaching experience. PhD in Applied Linguistics, published researcher in pronunciation pedagogy.",
    image: "👩‍🏫",
    linkedin: "#",
    twitter: "#",
    email: "emily@accentcoach.ai",
  },
  {
    name: "David Kim",
    role: "Lead Product Designer",
    bio: "Former Duolingo designer focused on educational UX. Passionate about making learning accessible and engaging.",
    image: "👨‍🎨",
    linkedin: "#",
    twitter: "#",
    email: "david@accentcoach.ai",
  },
]

const milestones = [
  { year: "2021", event: "Company founded by AI researchers", icon: "🚀" },
  { year: "2022", event: "First AI pronunciation model launched", icon: "🤖" },
  { year: "2023", event: "Reached 1,000+ active users", icon: "👥" },
  { year: "2024", event: "5,000+ users, Series A funding", icon: "📈" },
]

const values = [
  {
    icon: Target,
    title: "Precision",
    description: "We use cutting-edge AI to provide the most accurate pronunciation feedback available.",
  },
  {
    icon: Heart,
    title: "Empathy",
    description: "We understand the challenges of language learning and create supportive, encouraging experiences.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "Quality pronunciation coaching should be available to everyone, everywhere, at any time.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously push the boundaries of what's possible in AI-powered language education.",
  },
]

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <Header />

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-amber-200/20 to-orange-200/15 rounded-full blur-3xl animate-float-gentle"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className={`text-center max-w-4xl mx-auto ${isVisible ? "animate-slide-up-smooth" : "opacity-0"}`}>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 mb-6">
              About Accent Coach
            </Badge>

            <h1 className="text-heading text-5xl lg:text-7xl text-slate-900 mb-6">
              Transforming English
              <span className="block text-golden-gradient mt-2">Pronunciation Learning</span>
            </h1>

            <p className="text-xl text-body max-w-3xl mx-auto leading-relaxed mb-8">
              We're on a mission to make perfect English pronunciation accessible to everyone through the power of
              artificial intelligence and personalized coaching.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
              >
                <Link href="/auth/signup">Start Your Journey</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="glass-refined bg-transparent">
                <Link href="/contact">Get In Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-heading text-4xl text-slate-900">Our Mission</h2>
              <p className="text-lg text-body leading-relaxed">
                Every day, millions of people struggle with English pronunciation, limiting their career opportunities
                and confidence. Traditional methods are expensive, time-consuming, and often inaccessible.
              </p>
              <p className="text-lg text-body leading-relaxed">
                We believe that with the right technology, anyone can achieve clear, confident English pronunciation.
                Our AI-powered platform provides instant, personalized feedback that adapts to each learner's unique
                needs and pace.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="glass-card-elegant">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-amber-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900">5,000+</div>
                  <div className="text-sm text-slate-600">Active Learners</div>
                </CardContent>
              </Card>
              <Card className="glass-card-elegant">
                <CardContent className="p-6 text-center">
                  <Globe className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900">50+</div>
                  <div className="text-sm text-slate-600">Countries</div>
                </CardContent>
              </Card>
              <Card className="glass-card-elegant">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900">98%</div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </CardContent>
              </Card>
              <Card className="glass-card-elegant">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900">4.8★</div>
                  <div className="text-sm text-slate-600">User Rating</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-amber-50/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-heading text-4xl text-slate-900 mb-6">Our Values</h2>
            <p className="text-xl text-body max-w-3xl mx-auto">
              These core principles guide everything we do, from product development to customer support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="glass-card-elegant hover-lift-subtle">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
                  <p className="text-body">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-heading text-4xl text-slate-900 mb-6">Our Journey</h2>
            <p className="text-xl text-body max-w-3xl mx-auto">
              From a research project to helping thousands of learners worldwide.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600"></div>

              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <Card className="glass-card-elegant">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{milestone.icon}</span>
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                            {milestone.year}
                          </Badge>
                        </div>
                        <p className="text-slate-700 font-medium">{milestone.event}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-amber-500 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-amber-50/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-heading text-4xl text-slate-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-body max-w-3xl mx-auto">
              Passionate experts in AI, linguistics, and education working together to revolutionize language learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="glass-card-elegant hover-lift-subtle">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                    {member.image}
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-amber-600 font-medium text-sm mb-4">{member.role}</p>
                  <p className="text-body text-sm leading-relaxed mb-6">{member.bio}</p>

                  <div className="flex justify-center gap-3">
                    <Button variant="outline" size="sm" asChild className="w-10 h-10 p-0 bg-transparent">
                      <Link href={member.linkedin}>
                        <Linkedin className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-10 h-10 p-0 bg-transparent">
                      <Link href={member.twitter}>
                        <Twitter className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-10 h-10 p-0 bg-transparent">
                      <Link href={`mailto:${member.email}`}>
                        <Mail className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-heading text-4xl mb-6">Ready to Join Our Mission?</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Whether you're looking to improve your pronunciation or join our team, we'd love to hear from you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              <Link href="/auth/signup">
                Start Learning Today
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/careers">View Open Positions</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
