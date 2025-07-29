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

type RouteParams = {
  params: Promise<{ id: string; memberId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId, memberId } = await params;
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
    const { id: organizationId, memberId } = await params;
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

    // Update user directly
    const updateData: any = {};
    
    if (updatedData.organizationRole !== undefined) {
      updateData.organization_role = updatedData.organizationRole;
    }
    if (updatedData.isActive !== undefined) {
      updateData.is_active = updatedData.isActive;
    }
    updateData.updated_at = new Date().toISOString();

    const { data: updatedMember, error: updateError } = await supabaseAdmin
      .from('users')
      .update(sanitizeData(updateData))
      .eq('id', memberId)
      .select(`
        id,
        organization_id,
        organization_role,
        is_active,
        created_at,
        updated_at,
        organizations:organization_id (
          id,
          name,
          address,
          email,
          created_at
        )
      `)
      .single();

    if (updateError) {
      return handleDatabaseError(updateError);
    }

    return createSuccessResponse(updatedMember);
  } catch (error) {
    console.error("Error updating member:", error);
    return createErrorResponse("Failed to update member");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId, memberId } = await params;
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
    const { error: deactivateError } = await supabaseAdmin
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId);

    if (deactivateError) {
      return handleDatabaseError(deactivateError);
    }

    return createSuccessResponse({ 
      message: "Member removed from organization successfully",
      id: memberId 
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return createErrorResponse("Failed to remove member");
  }
}
