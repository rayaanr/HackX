"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Get current user from Supabase auth
async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Failed to get current user: ${error.message}`);
  }

  return user;
}

// Sign out user
async function signOut(): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`);
  }
}

// Sign in with email and password
async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<User> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("No user returned from sign in");
  }

  return data.user;
}

// Sign up with email and password
async function signUpWithEmailPassword(
  email: string,
  password: string,
): Promise<User | null> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign up: ${error.message}`);
  }

  return data.user;
}

// Update user profile
async function updateUserProfile(updates: {
  display_name?: string;
  avatar_url?: string;
  [key: string]: any;
}): Promise<User> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("No user returned from profile update");
  }

  return data.user;
}

// Hook to get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Authentication")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook to sign in with email and password
export function useSignInWithEmailPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithEmailPassword(email, password),
    onSuccess: () => {
      // Invalidate current user query to refresh auth state
      queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
    onError: (error) => {
      console.error("Failed to sign in:", error);
    },
  });
}

// Hook to sign up with email and password
export function useSignUpWithEmailPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signUpWithEmailPassword(email, password),
    onSuccess: () => {
      // Invalidate current user query to refresh auth state
      queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
    onError: (error) => {
      console.error("Failed to sign up:", error);
    },
  });
}

// Hook to sign out
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Clear all cached data on sign out
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Failed to sign out:", error);
    },
  });
}

// Hook to update user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      // Invalidate current user query to refresh profile data
      queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
    onError: (error) => {
      console.error("Failed to update user profile:", error);
    },
  });
}
