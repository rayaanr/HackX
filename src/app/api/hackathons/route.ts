import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hackathonSchema } from '@/lib/schemas/hackathon-schema'
import { createHackathon, getUserHackathons } from '@/lib/server/database/hackathons'

// POST /api/hackathons - Create a new hackathon
export async function POST(request: NextRequest) {
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

    // Create hackathon
    const result = await createHackathon(validation.data, user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Hackathon created successfully',
        data: result.data 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('API Error - POST /api/hackathons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/hackathons - Get all hackathons for authenticated user
export async function GET(request: NextRequest) {
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

    // Get user's hackathons
    const result = await getUserHackathons(user.id)

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
    console.error('API Error - GET /api/hackathons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}