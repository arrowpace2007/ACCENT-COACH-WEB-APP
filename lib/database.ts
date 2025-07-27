import { supabase } from "./supabase"
import type { User, PracticeSession, Achievement, UserSettings } from "./supabase"

export const databaseService = {
  // User operations
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
    return data
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Practice session operations
  async createPracticeSession(session: Omit<PracticeSession, "id" | "created_at">) {
    const { data, error } = await supabase.from("practice_sessions").insert(session).select().single()

    if (error) throw error
    return data
  },

  async getUserPracticeSessions(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async getPracticeSessionStats(userId: string) {
    const { data, error } = await supabase
      .from("practice_sessions")
      .select("score, duration, created_at")
      .eq("user_id", userId)

    if (error) throw error

    const sessions = data || []
    const totalSessions = sessions.length
    const averageScore =
      sessions.length > 0 ? sessions.reduce((sum, session) => sum + session.score, 0) / sessions.length : 0
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0)

    return {
      totalSessions,
      averageScore: Math.round(averageScore),
      totalDuration,
    }
  },

  // Achievement operations
  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createAchievement(achievement: Omit<Achievement, "id" | "earned_at">) {
    const { data, error } = await supabase.from("achievements").insert(achievement).select().single()

    if (error) throw error
    return data
  },

  // Settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

    if (error) {
      console.error("Error fetching user settings:", error)
      return null
    }
    return data
  },

  async updateUserSettings(userId: string, settings: Partial<UserSettings>) {
    const { data, error } = await supabase
      .from("user_settings")
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Daily progress operations
  async updateDailyProgress(
    userId: string,
    date: string,
    progress: {
      sessions_completed: number
      total_duration: number
      average_score: number
      goal_met: boolean
    },
  ) {
    const { data, error } = await supabase
      .from("daily_progress")
      .upsert({
        user_id: userId,
        date,
        ...progress,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserStreak(userId: string) {
    const { data, error } = await supabase
      .from("daily_progress")
      .select("date, goal_met")
      .eq("user_id", userId)
      .eq("goal_met", true)
      .order("date", { ascending: false })

    if (error) throw error

    // Calculate current streak
    const progressDays = data || []
    let currentStreak = 0
    const today = new Date().toISOString().split("T")[0]

    for (let i = 0; i < progressDays.length; i++) {
      const progressDate = progressDays[i].date
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedDateStr = expectedDate.toISOString().split("T")[0]

      if (progressDate === expectedDateStr) {
        currentStreak++
      } else {
        break
      }
    }

    return currentStreak
  },
}
