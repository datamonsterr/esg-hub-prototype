import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
} from "@/src/lib/supabase-utils";

type RouteParams = {
  params: Promise<{ clerkId: string }>;
};

/**
 * Get user by Clerk ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { clerkId } = await params;
    const userContext = await getCurrentUserContext();

    // Users can only access their own data or admins can access any
    if (userContext.userId !== clerkId && userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied", 403);
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        organization_id,
        organization_role,
        is_active,
        organizations:organization_id (
          id,
          name,
          address,
          email,
          created_at
        )
      `)
      .eq('id', clerkId)
      .single();

    if (error && error.code === 'PGRST116') {
      return createErrorResponse("User not found", 404);
    }

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(data);
  } catch (error) {
    console.error("Error getting user by Clerk ID:", error);
    return createErrorResponse("Failed to get user");
  }
}

/**
 * Update user by Clerk ID
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { clerkId } = await params;
    const userContext = await getCurrentUserContext();
    const updatedData = await request.json();

    // Users can only update their own data or admins can update any
    if (userContext.userId !== clerkId && userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied", 403);
    }

    const updateData: any = {};
    
    if (updatedData.organizationId !== undefined) {
      updateData.organization_id = updatedData.organizationId;
    }
    if (updatedData.organizationRole !== undefined) {
      // Only admins can update organization role
      if (userContext.organizationRole !== 'admin') {
        return createErrorResponse("Access denied: Admin role required to update user role", 403);
      }
      updateData.organization_role = updatedData.organizationRole;
    }
    if (updatedData.isActive !== undefined) {
      // Only admins can update active status
      if (userContext.organizationRole !== 'admin') {
        return createErrorResponse("Access denied: Admin role required to update user status", 403);
      }
      updateData.is_active = updatedData.isActive;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', clerkId)
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

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(data);
  } catch (error) {
    console.error("Error updating user:", error);
    return createErrorResponse("Failed to update user");
  }
}
