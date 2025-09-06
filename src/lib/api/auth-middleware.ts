import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export async function authenticateUser(
  request?: NextRequest,
): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: "Authentication failed",
    };
  }
}

export function createAuthResponse(error: string, status = 401) {
  return NextResponse.json({ error }, { status });
}

export async function withAuth<T>(
  handler: (user: any, ...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<NextResponse | T> {
  const authResult = await authenticateUser();

  if (!authResult.success) {
    return createAuthResponse(authResult.error || "Authentication required");
  }

  return handler(authResult.user, ...args);
}
