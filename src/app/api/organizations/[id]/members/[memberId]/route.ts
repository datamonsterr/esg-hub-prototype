import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  checkOrganizationAccess,
  handleDatabaseError,
  sanitizeData,
  addUpdateTimestamp,
} from "@/src/lib/supabase-utils";
import { updateUser, deactivateUser } from "@/src/lib/user-utils";

type RouteParams = {
  params: Promise<{ id: string; memberId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationIdParam, memberId } = await params;
    const organizationId = parseInt(organizationIdParam);
    const userContext = await checkOrganizationAccess(organizationId);

    const { data: member, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        organization_id,
        organization_role,
        is_active,
        organizations:organization_id (
          id,
          name
        )
      `)
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code === 'PGRST116') {
      return createErrorResponse("Member not found", 404);
    }

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    return createErrorResponse("Failed to fetch member");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationIdParam, memberId } = await params;
    const organizationId = parseInt(organizationIdParam);
    const userContext = await checkOrganizationAccess(organizationId);
    const updatedData = await request.json();

    // Only admins can update members
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    // Check if member exists and belongs to the organization
    const { data: existingMember, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, organization_id')
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return createErrorResponse("Member not found", 404);
    }

    if (fetchError) {
      return handleDatabaseError(fetchError);
    }

    // Update user using user-utils
    const updatedMember = await updateUser(memberId, {
      organizationRole: updatedData.organizationRole,
      isActive: updatedData.isActive,
    });

    return createSuccessResponse(updatedMember);
  } catch (error) {
    console.error("Error updating member:", error);
    return createErrorResponse("Failed to update member");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationIdParam, memberId } = await params;
    const organizationId = parseInt(organizationIdParam);
    const userContext = await checkOrganizationAccess(organizationId);

    // Only admins can remove members
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    // Check if member exists and belongs to the organization
    const { data: existingMember, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, organization_id')
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return createErrorResponse("Member not found", 404);
    }

    if (fetchError) {
      return handleDatabaseError(fetchError);
    }

    // Deactivate user instead of deleting (soft delete)
    await deactivateUser(memberId);

    return createSuccessResponse({ 
      message: "Member removed from organization successfully",
      id: memberId 
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return createErrorResponse("Failed to remove member");
  }
}
