"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Mic, ChevronDown, BookOpen, TrendingUp, Brain, Target, Award, Clock, BarChart3, Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Updated to match home page design */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-2.5 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 font-playfair tracking-tight">
              Accent Coach
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              asChild
              className="text-slate-700 hover:text-amber-600 hover:bg-amber-50 font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-sm"
            >
              <Link href="/practice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Practice
              </Link>
            </Button>

            <Button
              variant="ghost"
              asChild
              className="text-slate-700 hover:text-amber-600 hover:bg-amber-50 font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-sm"
            >
              <Link href="/progress" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress
              </Link>
            </Button>

            <Button
              variant="ghost"
              asChild
              className="text-slate-700 hover:text-amber-600 hover:bg-amber-50 font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-sm"
            >
              <Link href="/library" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Library
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-slate-700 hover:text-amber-600 hover:bg-amber-50 font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-sm"
                >
                  Features
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80 p-2">
                <div className="grid grid-cols-1 gap-1">
                  <DropdownMenuItem className="p-3 rounded-lg hover:bg-amber-50 cursor-default">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">AI-Powered Analysis</div>
                        <div className="text-sm text-slate-600">Advanced voice analysis with real-time feedback</div>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="p-3 rounded-lg hover:bg-amber-50 cursor-default">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-2">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Progress Tracking</div>
                        <div className="text-sm text-slate-600">Detailed analytics and improvement charts</div>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="p-3 rounded-lg hover:bg-amber-50 cursor-default">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-2">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Targeted Practice</div>
                        <div className="text-sm text-slate-600">
                          Focus on specific sounds and pronunciation patterns
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="p-3 rounded-lg hover:bg-amber-50 cursor-default">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-2">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Daily Challenges</div>
                        <div className="text-sm text-slate-600">Engaging daily practice with streak rewards</div>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="p-3 rounded-lg hover:bg-amber-50 cursor-default">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-2">
                        <Award className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Achievement System</div>
                        <div className="text-sm text-slate-600">Earn badges and unlock rewards as you improve</div>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="p-3 rounded-lg hover:bg-amber-50 cursor-default">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-2">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Instant Feedback</div>
                        <div className="text-sm text-slate-600">Get immediate pronunciation scores and tips</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              asChild
              className="text-gray-700 hover:text-amber-600 hover:bg-amber-50 font-medium px-4 py-2 rounded-lg transition-all duration-200 hidden sm:flex"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>

            <Button
              asChild
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Link href="/auth/signup">Get Started</Link>
            </Button>

            {/* Mobile Menu Button - Enhanced styling */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-amber-50 rounded-lg p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="flex flex-col gap-1">
                <div
                  className={`w-5 h-0.5 bg-amber-600 transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                ></div>
                <div
                  className={`w-5 h-0.5 bg-amber-600 transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}
                ></div>
                <div
                  className={`w-5 h-0.5 bg-amber-600 transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                ></div>
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col gap-2">
              <Button
                variant="ghost"
                asChild
                className="justify-start text-gray-700 hover:text-amber-600 hover:bg-amber-50 font-medium"
              >
                <Link href="/practice" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Practice
                </Link>
              </Button>

              <Button
                variant="ghost"
                asChild
                className="justify-start text-gray-700 hover:text-amber-600 hover:bg-amber-50 font-medium"
              >
                <Link href="/progress" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Progress
                </Link>
              </Button>

              <Button
                variant="ghost"
                asChild
                className="justify-start text-gray-700 hover:text-amber-600 hover:bg-amber-50 font-medium"
              >
                <Link href="/library" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Library
                </Link>
              </Button>

              {/* Mobile Features Section */}
              <div className="text-gray-700 font-medium px-4 py-2">Features</div>
              <div className="pl-4 space-y-2">
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-1.5">
                    <Brain className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900">AI-Powered Analysis</div>
                    <div className="text-xs text-slate-600">Advanced voice analysis with real-time feedback</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-1.5">
                    <BarChart3 className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900">Progress Tracking</div>
                    <div className="text-xs text-slate-600">Detailed analytics and improvement charts</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-1.5">
                    <Target className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900">Targeted Practice</div>
                    <div className="text-xs text-slate-600">Focus on specific sounds and patterns</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-1.5">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900">Daily Challenges</div>
                    <div className="text-xs text-slate-600">Engaging daily practice with rewards</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-1.5">
                    <Award className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900">Achievement System</div>
                    <div className="text-xs text-slate-600">Earn badges and unlock rewards</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-1.5">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900">Instant Feedback</div>
                    <div className="text-xs text-slate-600">Get immediate pronunciation scores</div>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                asChild
                className="justify-start text-gray-700 hover:text-amber-600 hover:bg-amber-50 font-medium sm:hidden"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
