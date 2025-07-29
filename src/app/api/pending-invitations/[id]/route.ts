import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  handleDatabaseError,
  sanitizeData,
} from "@/src/lib/supabase-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const { status, acceptedAt } = body;

    if (status !== "accepted") {
      return createErrorResponse("Invalid status", 400);
    }

    // Find the invitation
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('organization_invites')
      .select(`
        id,
        email,
        organization_id,
        organization_role,
        status,
        expires_at,
        organizations:organization_id (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !invitation) {
      return createErrorResponse("Invitation not found", 404);
    }

    // Check if invitation is already accepted
    if (invitation.status === "accepted") {
      return createErrorResponse("Invitation already accepted", 400);
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return createErrorResponse("Invitation has expired", 400);
    }

    // Update invitation status
    const { error: updateError } = await supabaseAdmin
      .from('organization_invites')
      .update({ 
        status: "accepted",
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return handleDatabaseError(updateError);
    }

    // Update user's organization info in Supabase
    try {
      const updateData = {
        organization_id: invitation.organization_id,
        organization_role: invitation.organization_role,
        updated_at: new Date().toISOString()
      };

      const { error: userUpdateError } = await supabaseAdmin
        .from('users')
        .update(sanitizeData(updateData))
        .eq('id', userId);

      if (userUpdateError) {
        throw userUpdateError;
      }
    } catch (updateUserError) {
      console.error("Error updating user organization:", updateUserError);
      return createErrorResponse("Failed to assign user to organization", 500);
    }

    // Return response matching the AcceptInvitationResponse interface
    return createSuccessResponse({
      organizationId: invitation.organization_id,
      organizationRole: invitation.organization_role,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data: invitation, error } = await supabaseAdmin
      .from('organization_invites')
      .select(`
        id,
        email,
        organization_id,
        organization_role,
        status,
        expires_at,
        created_at,
        organizations:organization_id (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error || !invitation) {
      return createErrorResponse("Invitation not found", 404);
    }

    return createSuccessResponse(invitation);
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
