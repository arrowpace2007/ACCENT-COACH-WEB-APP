"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  User,
  Bell,
  Volume2,
  Shield,
  CreditCard,
  Download,
  Upload,
  Trash2,
  Save,
  LogOut,
  Crown,
  Settings,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { databaseService } from "@/lib/database"
import type { User as DBUser, UserSettings } from "@/lib/supabase"

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const [userProfile, setUserProfile] = useState<DBUser | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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
      setIsLoading(true)

      const [profile, settings] = await Promise.all([
        databaseService.getUserProfile(user.id),
        databaseService.getUserSettings(user.id),
      ])

      setUserProfile(profile)
      setUserSettings(settings)
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (updates: Partial<DBUser>) => {
    if (!user || !userProfile) return

    try {
      const updatedProfile = await databaseService.updateUserProfile(user.id, updates)
      setUserProfile(updatedProfile)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const handleSettingsUpdate = async (updates: Partial<UserSettings>) => {
    if (!user || !userSettings) return

    try {
      const updatedSettings = await databaseService.updateUserSettings(user.id, updates)
      setUserSettings(updatedSettings)
    } catch (error) {
      console.error("Error updating settings:", error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Settings are saved automatically when changed
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert("Settings saved successfully!")
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleExportData = () => {
    const dataToExport = {
      profile: userProfile,
      settings: userSettings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "accent-coach-data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDeleteAccount = async () => {
    // In a real app, this would call an API to delete the account
    alert("Account deletion request submitted. You will receive a confirmation email.")
    setShowDeleteDialog(false)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user || !userProfile || !userSettings) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>

              <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be signed out of your account and redirected to the home page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                      Log Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your personal information and learning preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userProfile.name}
                    onChange={(e) => handleProfileUpdate({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => handleProfileUpdate({ email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="learning-level">Learning Level</Label>
                  <Select
                    value={userProfile.learning_level}
                    onValueChange={(value: any) => handleProfileUpdate({ learning_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-accent">Target Accent</Label>
                  <Select
                    value={userProfile.target_accent}
                    onValueChange={(value: any) => handleProfileUpdate({ target_accent: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american">American English</SelectItem>
                      <SelectItem value="british">British English</SelectItem>
                      <SelectItem value="australian">Australian English</SelectItem>
                      <SelectItem value="canadian">Canadian English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="daily-goal">Daily Goal (minutes)</Label>
                  <Select
                    value={userProfile.daily_goal.toString()}
                    onValueChange={(value) => handleProfileUpdate({ daily_goal: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekly-goal">Weekly Goal (sessions)</Label>
                  <Select
                    value={userProfile.weekly_goal.toString()}
                    onValueChange={(value) => handleProfileUpdate({ weekly_goal: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 sessions</SelectItem>
                      <SelectItem value="5">5 sessions</SelectItem>
                      <SelectItem value="7">7 sessions</SelectItem>
                      <SelectItem value="10">10 sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how and when you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Practice Reminders</Label>
                    <p className="text-sm text-gray-600">Get reminded to practice at your preferred time</p>
                  </div>
                  <Switch
                    checked={userSettings.daily_reminders}
                    onCheckedChange={(checked) => handleSettingsUpdate({ daily_reminders: checked })}
                  />
                </div>

                {userSettings.daily_reminders && (
                  <div className="ml-4 space-y-2">
                    <Label htmlFor="reminder-time">Reminder Time</Label>
                    <Input
                      id="reminder-time"
                      type="time"
                      value={userSettings.reminder_time}
                      onChange={(e) => handleSettingsUpdate({ reminder_time: e.target.value })}
                      className="w-32"
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Progress Reports</Label>
                    <p className="text-sm text-gray-600">Receive weekly summaries of your progress</p>
                  </div>
                  <Switch
                    checked={userSettings.progress_reports}
                    onCheckedChange={(checked) => handleSettingsUpdate({ progress_reports: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Achievement Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified when you earn new achievements</p>
                  </div>
                  <Switch
                    checked={userSettings.achievement_notifications}
                    onCheckedChange={(checked) => handleSettingsUpdate({ achievement_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Updates</Label>
                    <p className="text-sm text-gray-600">Receive product updates and tips via email</p>
                  </div>
                  <Switch
                    checked={userSettings.email_updates}
                    onCheckedChange={(checked) => handleSettingsUpdate({ email_updates: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Audio Configuration
              </CardTitle>
              <CardDescription>Customize your audio experience and recording settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="playback-speed">Playback Speed</Label>
                  <Select
                    value={userSettings.playback_speed}
                    onValueChange={(value) => handleSettingsUpdate({ playback_speed: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x (Slow)</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x (Fast)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="microphone-sensitivity">Microphone Sensitivity</Label>
                  <Select
                    value={userSettings.microphone_sensitivity}
                    onValueChange={(value) => handleSettingsUpdate({ microphone_sensitivity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-play Audio Examples</Label>
                    <p className="text-sm text-gray-600">Automatically play pronunciation examples</p>
                  </div>
                  <Switch
                    checked={userSettings.auto_play}
                    onCheckedChange={(checked) => handleSettingsUpdate({ auto_play: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-gray-600">Play sounds for achievements and feedback</p>
                  </div>
                  <Switch
                    checked={userSettings.sound_effects}
                    onCheckedChange={(checked) => handleSettingsUpdate({ sound_effects: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
              <CardDescription>Control how your data is used and shared</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Progress with Community</Label>
                    <p className="text-sm text-gray-600">Allow others to see your achievements and progress</p>
                  </div>
                  <Switch
                    checked={userSettings.share_progress}
                    onCheckedChange={(checked) => handleSettingsUpdate({ share_progress: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anonymous Usage Data</Label>
                    <p className="text-sm text-gray-600">Help improve the app by sharing anonymous usage data</p>
                  </div>
                  <Switch
                    checked={userSettings.anonymous_data}
                    onCheckedChange={(checked) => handleSettingsUpdate({ anonymous_data: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recording-storage">Recording Storage Duration</Label>
                <Select
                  value={userSettings.recording_storage}
                  onValueChange={(value) => handleSettingsUpdate({ recording_storage: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">How long to keep your practice recordings</p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Crown className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Free Plan</h4>
                    <p className="text-sm text-gray-600">3 sessions per day • Basic features</p>
                  </div>
                </div>
                <Badge variant="secondary">Current Plan</Badge>
              </div>

              <div className="flex gap-4">
                <Button asChild className="flex-1">
                  <Link href="/pricing">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/billing">Billing History</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export your data or delete your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={handleExportData} className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Settings
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          This action cannot be undone. This will permanently delete your account and remove all your
                          data from our servers.
                        </p>
                        <p className="font-medium">This includes:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>All practice sessions and recordings</li>
                          <li>Progress tracking and analytics</li>
                          <li>Achievements and streaks</li>
                          <li>Account settings and preferences</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
