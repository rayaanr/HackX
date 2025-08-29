"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: { firstName?: string; lastName?: string }) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()
  const supabase = createClient()


  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Update query cache when auth state changes
      queryClient.setQueryData(['session'], session)
      
      // Only show toast for explicit auth actions, not for token refresh or initial load
      if (event === 'SIGNED_OUT') {
        toast.success('Successfully signed out!')
        queryClient.clear()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, queryClient])

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Successfully signed in!')
    },
    onError: (error: AuthError) => {
      toast.error(error.message)
    },
  })

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      metadata 
    }: { 
      email: string; 
      password: string; 
      metadata?: { firstName?: string; lastName?: string } 
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Check your email for confirmation link!')
    },
    onError: (error: AuthError) => {
      toast.error(error.message)
    },
  })

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
    },
    onError: (error: AuthError) => {
      toast.error(error.message)
    },
  })

  // Google sign in mutation
  const googleSignInMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
      return data
    },
    onError: (error: AuthError) => {
      toast.error(error.message)
    },
  })

  const value: AuthContextType = {
    user,
    session,
    loading: loading || signInMutation.isPending || signUpMutation.isPending || signOutMutation.isPending,
    signIn: async (email: string, password: string) => {
      await signInMutation.mutateAsync({ email, password })
    },
    signUp: async (email: string, password: string, metadata?: { firstName?: string; lastName?: string }) => {
      await signUpMutation.mutateAsync({ email, password, metadata })
    },
    signOut: async () => {
      await signOutMutation.mutateAsync()
    },
    signInWithGoogle: async () => {
      await googleSignInMutation.mutateAsync()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}