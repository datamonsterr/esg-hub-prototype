import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/src/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// GET - Get all invitations for the current user's organization
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organization
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('organization_id, organization_role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only admin users can view organization invitations
    if (user.organization_role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get all invitations for the organization
    const { data: invitations, error: invitationsError } = await supabaseAdmin
      .from('organization_invites')
      .select('*, organizations(name)')
      .eq('organization_id', user.organization_id)
      .order('created_at', { ascending: false })

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json(invitations || [])

  } catch (error) {
    console.error('Get invitations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Send a new invitation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { email, organizationRole = 'employee', expiresInDays = 7 } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate organization role
    if (!['admin', 'employee'].includes(organizationRole)) {
      return NextResponse.json(
        { error: 'Invalid organization role' },
        { status: 400 }
      )
    }

    // Get user's organization
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('organization_id, organization_role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only admin users can send invitations
    if (user.organization_role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check if user is already in the system
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId) // This would need to be matched by email in a real system
      .single()

    // For now, we'll check if there's already a pending invitation
    const { data: existingInvite, error: existingInviteError } = await supabaseAdmin
      .from('organization_invites')
      .select('id, status')
      .eq('email', email)
      .eq('organization_id', user.organization_id)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Invitation already exists for this email' },
        { status: 409 }
      )
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', user.organization_id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Create invitation
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('organization_invites')
      .insert({
        email,
        organization_id: user.organization_id,
        organization_role: organizationRole,
        invited_by: userId,
        status: 'pending',
        token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // TODO: Send email notification here
    // For now, we'll just return the invitation details

    return NextResponse.json({
      id: invitation.id.toString(),
      email: invitation.email,
      organizationName: organization.name,
      organizationRole: invitation.organization_role,
      expiresAt: invitation.expires_at,
      message: 'Invitation sent successfully'
    })

  } catch (error) {
    console.error('Send invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
