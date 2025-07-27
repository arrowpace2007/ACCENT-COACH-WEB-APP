"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Mic,
  TrendingUp,
  Target,
  Award,
  Clock,
  Settings,
  User,
  Bell,
  Play,
  BarChart3,
  Calendar,
  Flame,
  Star,
  ChevronRight,
  Volume2,
  Crown,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { databaseService } from "@/lib/database"
import type { User as DBUser, PracticeSession } from "@/lib/supabase"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userProfile, setUserProfile] = useState<DBUser | null>(null)
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    totalDuration: 0,
  })
  const [currentStreak, setCurrentStreak] = useState(0)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Mock achievements for now
  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first session", earned: true },
    { id: 2, title: "Week Warrior", description: "Practice 7 days in a row", earned: currentStreak >= 7 },
    { id: 3, title: "Pronunciation Pro", description: "Score 90+ on pronunciation", earned: stats.averageScore >= 90 },
    { id: 4, title: "Consistency King", description: "Practice 30 days in a row", earned: currentStreak >= 30 },
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadUserData()
    }
  }, [user, loading, router])

  const loadUserData = async () => {
    if (!user) return

    try {
      setIsLoadingData(true)

      // Load user profile
      const profile = await databaseService.getUserProfile(user.id)
      setUserProfile(profile)

      // Load recent sessions
      const sessions = await databaseService.getUserPracticeSessions(user.id, 5)
      setRecentSessions(sessions)

      // Load stats
      const sessionStats = await databaseService.getPracticeSessionStats(user.id)
      setStats(sessionStats)

      // Load streak
      const streak = await databaseService.getUserStreak(user.id)
      setCurrentStreak(streak)
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "pronunciation":
        return <Volume2 className="h-5 w-5 text-blue-600" />
      case "conversation":
        return <Mic className="h-5 w-5 text-blue-600" />
      case "stress":
        return <Target className="h-5 w-5 text-blue-600" />
      default:
        return <Mic className="h-5 w-5 text-blue-600" />
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`

    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-2">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Accent Coach</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {userProfile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <span className="hidden sm:block">{userProfile.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="flex items-center gap-2">
                      <span>Help & Support</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userProfile.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-600">Ready to improve your pronunciation today?</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Practice</CardTitle>
                  <CardDescription>Jump into your daily practice session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button asChild className="h-20 flex-col gap-2">
                      <Link href="/practice">
                        <Mic className="h-6 w-6" />
                        <span>Start Practice</span>
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="h-20 flex-col gap-2 bg-transparent">
                      <Link href="/practice/daily-challenge">
                        <Target className="h-6 w-6" />
                        <span>Daily Challenge</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Your Progress
                  </CardTitle>
                  <CardDescription>Track your improvement over time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
                      <p className="text-sm text-gray-600">Average Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{formatDuration(stats.totalDuration)}</div>
                      <p className="text-sm text-gray-600">Total Practice Time</p>
                    </div>
                  </div>

                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/progress" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      View Detailed Analytics
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Sessions
                  </CardTitle>
                  <CardDescription>Your latest practice activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentSessions.length > 0 ? (
                    <div className="space-y-4">
                      {recentSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              {getSessionTypeIcon(session.session_type)}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{session.title}</h4>
                              <p className="text-sm text-gray-600">
                                {getTimeAgo(session.created_at)} • {formatDuration(session.duration)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={session.score >= 80 ? "default" : "secondary"}>{session.score}%</Badge>
                            <Button variant="ghost" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No practice sessions yet</p>
                      <Button asChild>
                        <Link href="/practice">Start Your First Session</Link>
                      </Button>
                    </div>
                  )}

                  {recentSessions.length > 0 && (
                    <Button variant="outline" asChild className="w-full mt-4 bg-transparent">
                      <Link href="/history" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        View All Sessions
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Streak Counter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">{currentStreak}</div>
                    <p className="text-gray-600 mb-4">days in a row</p>
                    <div className="text-sm text-gray-500">
                      {currentStreak > 0
                        ? "Keep it up! Practice today to maintain your streak."
                        : "Start practicing to begin your streak!"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Weekly Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Sessions completed</span>
                      <span className="text-sm text-gray-600">
                        {Math.min(stats.totalSessions, userProfile.weekly_goal)}/{userProfile.weekly_goal}
                      </span>
                    </div>
                    <Progress
                      value={(Math.min(stats.totalSessions, userProfile.weekly_goal) / userProfile.weekly_goal) * 100}
                      className="h-2"
                    />
                    <p className="text-sm text-gray-600">
                      {Math.max(0, userProfile.weekly_goal - stats.totalSessions)} more sessions to reach your weekly
                      goal
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.slice(0, 3).map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          achievement.earned ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            achievement.earned ? "bg-yellow-500" : "bg-gray-300"
                          }`}
                        >
                          {achievement.earned ? (
                            <Star className="h-4 w-4 text-white" />
                          ) : (
                            <Star className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`text-sm font-medium ${
                              achievement.earned ? "text-yellow-800" : "text-gray-600"
                            }`}
                          >
                            {achievement.title}
                          </h4>
                          <p className={`text-xs ${achievement.earned ? "text-yellow-600" : "text-gray-500"}`}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" asChild className="w-full mt-4 bg-transparent">
                    <Link href="/achievements" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      View All Achievements
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Upgrade Section */}
              <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Unlock Premium Features</h3>
                      <p className="text-blue-100 text-sm mb-4">
                        Get unlimited practice sessions, detailed analytics, and personalized coaching
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full bg-white text-blue-600 hover:bg-gray-100"
                        asChild
                      >
                        <Link href="/pricing">Upgrade to Pro - $6.99/mo</Link>
                      </Button>
                      <p className="text-xs text-blue-200">7-day free trial • Cancel anytime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
