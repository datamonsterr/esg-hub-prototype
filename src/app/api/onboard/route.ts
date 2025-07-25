import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/src/lib/supabase'

// GET - Check onboarding status for current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user exists in database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*, organizations(name, email)')
      .eq('id', userId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error checking user:', userError)
      return NextResponse.json(
        { error: 'Failed to check user status' },
        { status: 500 }
      )
    }

    if (user) {
      // User is already onboarded
      return NextResponse.json({
        isOnboarded: true,
        user: {
          id: user.id,
          organizationId: user.organization_id,
          organizationRole: user.organization_role,
          organizationName: user.organizations?.name,
          isActive: user.is_active
        }
      })
    }

    // User is not onboarded - check for pending invitations
    // Note: In a real app, you'd match by email from Clerk user profile
    const { data: pendingInvitations, error: invitationsError } = await supabaseAdmin
      .from('organization_invites')
      .select('*, organizations(name)')
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())

    if (invitationsError) {
      console.error('Error checking invitations:', invitationsError)
      return NextResponse.json(
        { error: 'Failed to check invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isOnboarded: false,
      pendingInvitations: (pendingInvitations || []).map(invitation => ({
        id: invitation.id,
        email: invitation.email,
        organizationId: invitation.organization_id,
        organizationName: invitation.organizations?.name,
        organizationRole: invitation.organization_role,
        expiresAt: invitation.expires_at,
        createdAt: invitation.created_at
      }))
    })

  } catch (error) {
    console.error('Check onboarding status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
