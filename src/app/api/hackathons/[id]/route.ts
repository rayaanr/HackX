import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hackathonSchema } from '@/lib/schemas/hackathon-schema'
import { getHackathonById, updateHackathon, deleteHackathon } from '@/lib/server/database/hackathons'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/hackathons/[id] - Get a specific hackathon
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get hackathon
    const result = await getHackathonById(id, user.id)

    if (!result.success) {
      if (result.error === 'Hackathon not found') {
        return NextResponse.json(
          { error: 'Hackathon not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: result.data
    })

  } catch (error) {
    console.error('API Error - GET /api/hackathons/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/hackathons/[id] - Update a specific hackathon
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate request data
    const validation = hackathonSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    // Update hackathon
    const result = await updateHackathon(id, validation.data, user.id)

    if (!result.success) {
      if (result.error === 'Hackathon not found or access denied') {
        return NextResponse.json(
          { error: 'Hackathon not found or access denied' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Hackathon updated successfully',
      data: result.data
    })

  } catch (error) {
    console.error('API Error - PUT /api/hackathons/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/hackathons/[id] - Delete a specific hackathon
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Delete hackathon
    const result = await deleteHackathon(id, user.id)

    if (!result.success) {
      if (result.error === 'Hackathon not found or access denied' || result.error === 'Hackathon not found') {
        return NextResponse.json(
          { error: 'Hackathon not found or access denied' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Hackathon deleted successfully'
    })

  } catch (error) {
    console.error('API Error - DELETE /api/hackathons/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}