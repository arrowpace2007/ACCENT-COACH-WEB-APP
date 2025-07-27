"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

const testimonials = [
  {
    name: "Maria Rodriguez",
    role: "Software Engineer",
    location: "Spain",
    content:
      "Accent Coach transformed my confidence in technical presentations. The AI feedback is incredibly detailed and helped me identify specific pronunciation issues. Now I lead international meetings with complete confidence!",
    rating: 5,
    avatar: "👩‍💻", // Professional woman emoji
    company: "Google",
    improvement: "40% improvement in 3 months",
  },
  {
    name: "Raj Patel",
    role: "Business Analyst",
    location: "India",
    content:
      "As someone preparing for international job interviews, this app was a game-changer. The business English content is exactly what I needed. I landed my dream job thanks to improved pronunciation!",
    rating: 5,
    avatar: "👨‍💼", // Professional man emoji
    company: "Microsoft",
    improvement: "Landed dream job",
  },
  {
    name: "Chen Wei",
    role: "Graduate Student",
    location: "China",
    content:
      "The progress tracking keeps me motivated daily. I can see my improvement week by week, and the challenges make practice engaging. My professors now understand me perfectly in presentations!",
    rating: 5,
    avatar: "👨‍🎓", // Graduate student emoji
    company: "Stanford University",
    improvement: "95% clarity score",
  },
  {
    name: "Fatima Al-Zahra",
    role: "Medical Resident",
    location: "UAE",
    content:
      "Communication is crucial in healthcare. Accent Coach helped me speak more clearly with patients and colleagues. The medical terminology practice was especially helpful for my residency.",
    rating: 5,
    avatar: "👩‍⚕️", // Female doctor emoji
    company: "Dubai Hospital",
    improvement: "Enhanced patient communication",
  },
  {
    name: "Carlos Silva",
    role: "Sales Manager",
    location: "Brazil",
    content:
      "My sales presentations improved dramatically after using Accent Coach. Clients understand me better, and I've closed more deals. The confidence boost is incredible!",
    rating: 5,
    avatar: "👨‍💼", // Business man emoji
    company: "Salesforce",
    improvement: "30% increase in sales",
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-amber-50/40 via-orange-50/30 to-slate-50 relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-amber-200/20 to-orange-200/15 rounded-full blur-3xl animate-float-gentle"></div>
        <div
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-200/15 to-amber-200/20 rounded-full blur-3xl animate-float-gentle"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative">
        <div className={`text-center mb-16 ${isVisible ? "animate-slide-up-smooth" : "opacity-0"}`}>
          <div className="inline-flex items-center gap-2 glass-golden-subtle px-4 py-2 rounded-full mb-6">
            <Quote className="h-5 w-5 text-amber-600" />
            <span className="text-amber-800 font-semibold text-sm">Success Stories</span>
          </div>

          <h2 className="text-heading text-4xl lg:text-6xl text-slate-900 mb-6">
            What Our Learners
            <span className="block text-golden-gradient mt-2">Are Saying</span>
          </h2>

          <p className="text-xl text-body max-w-3xl mx-auto">
            Join thousands of learners who have transformed their English pronunciation and
            <span className="text-amber-700 font-semibold"> achieved their career goals</span> with Accent Coach.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div
            className={`relative ${isVisible ? "animate-fade-in-scale" : "opacity-0"}`}
            style={{ animationDelay: "0.3s" }}
          >
            <Card className="glass-card-elegant border-0 shadow-xl hover-lift-subtle overflow-hidden">
              <CardContent className="p-12">
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current text-amber-400" />
                      ))}
                    </div>

                    <Quote className="h-10 w-10 text-amber-400 mb-4" />

                    <p className="text-xl text-slate-700 leading-relaxed font-medium italic">
                      "{testimonials[currentIndex].content}"
                    </p>

                    <div className="glass-refined rounded-lg p-3 inline-block">
                      <div className="text-green-700 font-semibold text-sm">
                        🎉 {testimonials[currentIndex].improvement}
                      </div>
                    </div>
                  </div>

                  <div className="text-center lg:text-left space-y-4">
                    <div className="relative inline-block">
                      {/* Emoji Avatar */}
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-4xl shadow-lg ring-3 ring-amber-200 mx-auto lg:mx-0">
                        {testimonials[currentIndex].avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full p-1.5">
                        <Star className="h-3 w-3 text-white fill-current" />
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-lg text-slate-900">{testimonials[currentIndex].name}</div>
                      <div className="text-amber-600 font-semibold text-sm">{testimonials[currentIndex].role}</div>
                      <div className="text-slate-500 text-sm">{testimonials[currentIndex].company}</div>
                      <div className="text-slate-400 text-xs mt-1">{testimonials[currentIndex].location}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                className="glass-refined hover-glow-soft rounded-full w-12 h-12 p-0 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 w-6"
                        : "bg-slate-300 hover:bg-amber-200"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                className="glass-refined hover-glow-soft rounded-full w-12 h-12 p-0 bg-transparent"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
