import { type NextRequest, NextResponse } from 'next/server'
import { getAllHackathons } from '@/lib/server/database/hackathons'

// GET /api/hackathons/all - Get all hackathons (for explore page)
export async function GET(_request: NextRequest) {
  try {
    // Get all hackathons - no authentication required for public explore page
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