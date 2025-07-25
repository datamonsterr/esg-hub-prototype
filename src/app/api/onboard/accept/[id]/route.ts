import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/src/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const invitationId = parseInt(id)

    if (isNaN(invitationId)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      )
    }

    // Get the invitation details
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('organization_invites')
      .select('*, organizations(name)')
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Update invitation status to expired
      await supabaseAdmin
        .from('organization_invites')
        .update({ status: 'expired' })
        .eq('id', invitationId)

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking existing user:', userCheckError)
      return NextResponse.json(
        { error: 'Failed to check user status' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already belongs to an organization' },
        { status: 400 }
      )
    }

    // Create user in database
    const { data: newUser, error: createUserError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        organization_id: invitation.organization_id,
        organization_role: invitation.organization_role,
        is_active: true
      })
      .select()
      .single()

    if (createUserError) {
      console.error('Error creating user:', createUserError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Update invitation status to accepted
    const { error: updateInviteError } = await supabaseAdmin
      .from('organization_invites')
      .update({ status: 'accepted' })
      .eq('id', invitationId)

    if (updateInviteError) {
      console.error('Error updating invitation:', updateInviteError)
      // User was created successfully, but invitation status update failed
      // This is not critical, continue with success response
    }

    return NextResponse.json({
      organizationId: invitation.organization_id.toString(),
      organizationRole: invitation.organization_role,
      organizationName: invitation.organizations?.name,
      message: 'Successfully joined organization'
    })

  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
