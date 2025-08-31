import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllHackathons } from '@/lib/server/database/hackathons'

// GET /api/hackathons/all - Get all hackathons (for explore page)
export async function GET(_request: NextRequest) {
  try {
    // Get authenticated user (optional for public hackathons)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Note: We don't require authentication for viewing all hackathons
    // as this is for the public explore page

    // Get all hackathons
    const result = await getAllHackathons()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: result.data
    })

  } catch (error) {
    console.error('API Error - GET /api/hackathons/all:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}