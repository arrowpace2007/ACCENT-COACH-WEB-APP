"use client"

import { useState, useEffect } from "react"
import { authService } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.getCurrentSession().then((session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { user } = await authService.signIn(email, password)
    return user
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const { user } = await authService.signUp(email, password, userData)
    return user
  }

  const signInWithGoogle = async () => {
    return await authService.signInWithGoogle()
  }

  const signOut = async () => {
    await authService.signOut()
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }
}
