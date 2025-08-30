import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface AuthenticatedRequest {
  user: User
}

/**
 * Authentication middleware for API routes
 * Returns the authenticated user or throws an error response
 */
export async function authenticate(request: NextRequest): Promise<User> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  return user
}

/**
 * Wrapper for API route handlers that require authentication
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: User, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const user = await authenticate(request)
      return await handler(request, user, ...args)
    } catch (error) {
      // If authenticate throws a NextResponse, return it
      if (error instanceof NextResponse) {
        return error
      }
      
      // Otherwise, return a generic error
      console.error('Authentication error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

/**
 * Success response helper
 */
export function successResponse(data: any, message?: string, status: number = 200) {
  return NextResponse.json(
    { 
      ...(message && { message }),
      data 
    },
    { status }
  )
}

/**
 * Validation error response helper
 */
export function validationErrorResponse(errors: any) {
  return NextResponse.json(
    { 
      error: 'Validation failed',
      details: errors
    },
    { status: 400 }
  )
}