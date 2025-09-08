"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Fetch current user
async function fetchCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Authentication error: ${authError.message}`);
  }

  return user;
}

// Hook to get current authenticated user
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("Authentication") ||
        errorMessage.includes("401")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}