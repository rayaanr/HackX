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

    // Convert date strings to Date objects for validation
    const processedBody = {
      ...body,
      registrationPeriod: body.registrationPeriod ? {
        ...body.registrationPeriod,
        registrationStartDate: body.registrationPeriod.registrationStartDate ? new Date(body.registrationPeriod.registrationStartDate) : undefined,
        registrationEndDate: body.registrationPeriod.registrationEndDate ? new Date(body.registrationPeriod.registrationEndDate) : undefined,
      } : undefined,
      hackathonPeriod: body.hackathonPeriod ? {
        ...body.hackathonPeriod,
        hackathonStartDate: body.hackathonPeriod.hackathonStartDate ? new Date(body.hackathonPeriod.hackathonStartDate) : undefined,
        hackathonEndDate: body.hackathonPeriod.hackathonEndDate ? new Date(body.hackathonPeriod.hackathonEndDate) : undefined,
      } : undefined,
      votingPeriod: body.votingPeriod ? {
        ...body.votingPeriod,
        votingStartDate: body.votingPeriod.votingStartDate ? new Date(body.votingPeriod.votingStartDate) : undefined,
        votingEndDate: body.votingPeriod.votingEndDate ? new Date(body.votingPeriod.votingEndDate) : undefined,
      } : undefined,
      schedule: body.schedule ? body.schedule.map((slot: Record<string, unknown>) => ({
        ...slot,
        startDateTime: slot.startDateTime ? new Date(slot.startDateTime as string) : undefined,
        endDateTime: slot.endDateTime ? new Date(slot.endDateTime as string) : undefined,
      })) : undefined,
    }

    // Validate request data
    const validation = hackathonSchema.safeParse(processedBody)
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