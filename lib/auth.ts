import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface AuthUser extends User {
  user_metadata: {
    name?: string
    learning_level?: string
    target_accent?: string
    learning_goal?: string
  }
}

export const authService = {
  // Sign up with email and password
  async signUp(
    email: string,
    password: string,
    userData: {
      name: string
      learning_level: string
      target_accent: string
      learning_goal: string
    },
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    if (error) throw error
    return data
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get current session
  async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
