"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Mic,
  ArrowRight,
  Heart,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "API", href: "/api" },
    { name: "Mobile App", href: "/mobile" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Help Center", href: "/help" },
    { name: "Community", href: "/community" },
    { name: "Tutorials", href: "/tutorials" },
    { name: "Success Stories", href: "/success-stories" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
  legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
    { name: "Accessibility", href: "/accessibility" },
    { name: "Security", href: "/security" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "#", color: "hover:text-blue-400" },
  { icon: Twitter, href: "#", color: "hover:text-sky-400" },
  { icon: Instagram, href: "#", color: "hover:text-pink-400" },
  { icon: Linkedin, href: "#", color: "hover:text-blue-500" },
  { icon: Youtube, href: "#", color: "hover:text-red-400" },
]

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-r from-amber-600/10 to-orange-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-600/10 to-amber-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        {/* Newsletter Section */}
        <div className="border-b border-slate-700">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 glass-golden-subtle px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span className="text-amber-400 font-semibold text-sm">Stay Updated</span>
              </div>

              <h3 className="text-heading text-3xl lg:text-4xl font-bold mb-4">Get the Latest Tips & Updates</h3>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Join 5,000+ learners receiving weekly pronunciation tips, new features, and exclusive content.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="glass-refined border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 rounded-xl bg-white/5"
                />
                <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 font-semibold px-6 rounded-xl hover-lift-subtle">
                  Subscribe
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <p className="text-sm text-slate-400 mt-4">No spam, unsubscribe at any time. We respect your privacy.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-6 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-xl">
                  <Mic className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-golden-gradient">Accent Coach</span>
              </div>

              <p className="text-slate-300 leading-relaxed text-lg">
                Transform your English pronunciation with AI-powered coaching. Join thousands of learners achieving
                fluent, confident communication.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors">
                  <Mail className="h-5 w-5" />
                  <span>hello@accentcoach.ai</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors">
                  <Phone className="h-5 w-5" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors">
                  <MapPin className="h-5 w-5" />
                  <span>San Francisco, CA</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className={`glass-refined hover:bg-white/10 p-3 rounded-xl transition-all duration-300 hover-lift-subtle ${social.color}`}
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-4 grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-golden-gradient mb-6">Product</h4>
                <ul className="space-y-3">
                  {footerLinks.product.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-slate-300 hover:text-amber-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-golden-gradient mb-6">Company</h4>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-slate-300 hover:text-amber-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-golden-gradient mb-6">Resources</h4>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-slate-300 hover:text-amber-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-golden-gradient mb-6">Legal</h4>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-slate-300 hover:text-amber-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <span>© 2024 Accent Coach. Made with</span>
                <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                <span>for language learners worldwide.</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span>🌍 Available in 15+ languages</span>
                <span>🔒 SOC 2 Compliant</span>
                <span>⚡ 99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
