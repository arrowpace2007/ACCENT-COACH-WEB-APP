"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Building,
  HelpCircle,
} from "lucide-react"
import { useState } from "react"

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help with your account, billing, or technical issues",
    contact: "support@accentcoach.ai",
    responseTime: "Within 24 hours",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team in real-time",
    contact: "Available in app",
    responseTime: "Instant response",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our team (Pro & Premium users)",
    contact: "+1 (555) 123-4567",
    responseTime: "Mon-Fri, 9AM-6PM PST",
    color: "from-purple-500 to-purple-600",
  },
]

const officeLocations = [
  {
    city: "San Francisco",
    address: "123 Innovation Drive, Suite 400",
    zipCode: "San Francisco, CA 94105",
    type: "Headquarters",
    phone: "+1 (555) 123-4567",
  },
  {
    city: "New York",
    address: "456 Tech Avenue, Floor 12",
    zipCode: "New York, NY 10001",
    type: "East Coast Office",
    phone: "+1 (555) 987-6543",
  },
]

const faqItems = [
  {
    question: "How accurate is the AI pronunciation analysis?",
    answer:
      "Our AI achieves 95%+ accuracy compared to human expert evaluations, using advanced speech recognition and phonetic analysis.",
  },
  {
    question: "Can I use Accent Coach on mobile devices?",
    answer: "Yes! Our web app works perfectly on mobile browsers. We're also developing native iOS and Android apps.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance with refunds.",
  },
  {
    question: "Is my voice data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption and never store your voice recordings permanently. All data is processed securely.",
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", subject: "", category: "", message: "" })
    }, 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <Header />

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-80 h-80 bg-gradient-to-r from-amber-200/20 to-orange-200/15 rounded-full blur-3xl animate-float-gentle"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 mb-6">
              Get In Touch
            </Badge>

            <h1 className="text-heading text-5xl lg:text-7xl text-slate-900 mb-6">
              We're Here to
              <span className="block text-golden-gradient mt-2">Help You Succeed</span>
            </h1>

            <p className="text-xl text-body max-w-3xl mx-auto leading-relaxed">
              Have questions about Accent Coach? Need technical support? Want to partner with us? Our team is ready to
              assist you on your pronunciation learning journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-heading text-4xl text-slate-900 mb-6">Choose Your Preferred Contact Method</h2>
            <p className="text-xl text-body max-w-3xl mx-auto">
              We offer multiple ways to get in touch. Pick the one that works best for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {contactMethods.map((method, index) => (
              <Card key={index} className="glass-card-elegant hover-lift-subtle">
                <CardContent className="p-8 text-center">
                  <div
                    className={`bg-gradient-to-r ${method.color} rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-6`}
                  >
                    <method.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{method.title}</h3>
                  <p className="text-body mb-4">{method.description}</p>

                  <div className="space-y-2">
                    <p className="font-medium text-slate-900">{method.contact}</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Clock className="h-3 w-3 mr-1" />
                      {method.responseTime}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-amber-50/20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="glass-card-elegant">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 flex items-center gap-2">
                  <Send className="h-6 w-6 text-amber-600" />
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent!</h3>
                    <p className="text-body">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing & Payments</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="press">Press & Media</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="Brief description of your inquiry"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Please provide details about your inquiry..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Contact Info & FAQ */}
            <div className="space-y-8">
              {/* Office Locations */}
              <Card className="glass-card-elegant">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                    <Building className="h-5 w-5 text-amber-600" />
                    Our Offices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {officeLocations.map((office, index) => (
                    <div key={index} className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-amber-600 mt-1" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{office.city}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {office.type}
                            </Badge>
                          </div>
                          <p className="text-body text-sm">{office.address}</p>
                          <p className="text-body text-sm">{office.zipCode}</p>
                          <p className="text-body text-sm flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {office.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick FAQ */}
              <Card className="glass-card-elegant">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-amber-600" />
                    Quick Answers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0">
                      <h4 className="font-medium text-slate-900 mb-2">{item.question}</h4>
                      <p className="text-body text-sm">{item.answer}</p>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                    <a href="/help">View All FAQs</a>
                  </Button>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card className="glass-card-elegant">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-body">Monday - Friday</span>
                      <span className="font-medium text-slate-900">9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body">Saturday</span>
                      <span className="font-medium text-slate-900">10:00 AM - 4:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body">Sunday</span>
                      <span className="font-medium text-slate-900">Closed</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-amber-800 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Email support is available 24/7 with responses within 24 hours
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
