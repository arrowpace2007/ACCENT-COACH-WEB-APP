import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  learning_level: "beginner" | "intermediate" | "advanced"
  target_accent: "american" | "british" | "australian" | "canadian"
  learning_goal: "professional" | "academic" | "social" | "travel" | "general"
  daily_goal: number
  weekly_goal: number
  created_at: string
  updated_at: string
}

export interface PracticeSession {
  id: string
  user_id: string
  title: string
  sentence: string
  score: number
  duration: number
  session_type: "pronunciation" | "conversation" | "stress" | "fluency"
  audio_url?: string
  feedback?: string
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  title: string
  description: string
  badge_type: string
  earned_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  daily_reminders: boolean
  progress_reports: boolean
  achievement_notifications: boolean
  email_updates: boolean
  reminder_time: string
  playback_speed: string
  microphone_sensitivity: string
  auto_play: boolean
  sound_effects: boolean
  share_progress: boolean
  anonymous_data: boolean
  recording_storage: string
  updated_at: string
}
