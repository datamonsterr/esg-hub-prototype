import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
  sanitizeData,
} from "@/src/lib/supabase-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userContext = await getCurrentUserContext();

    // Users can only access their own data or admins can access any
    if (userContext.userId !== id && userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied", 403);
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
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
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      return createErrorResponse("User not found", 404);
    }

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return createErrorResponse("Failed to fetch user");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userContext = await getCurrentUserContext();
    const updatedData = await request.json();

    // Users can only update their own data or admins can update any
    if (userContext.userId !== id && userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied", 403);
    }

    // Get the user first to verify it exists
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (getUserError && getUserError.code === 'PGRST116') {
      return createErrorResponse("User not found", 404);
    }

    if (getUserError) {
      return handleDatabaseError(getUserError);
    }

    // Extract only the allowed fields for update
    const allowedFields = ['organization_role'];
    const filteredData = Object.keys(updatedData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updatedData[key];
        return obj;
      }, {} as any);

    // Only admins can update organization_role
    if (filteredData.organization_role && userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required to update user role", 403);
    }

    // Transform camelCase to snake_case for database update
    const updateData: any = {};
    if (filteredData.organization_role !== undefined) {
      updateData.organization_role = filteredData.organization_role;
    }
    updateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(sanitizeData(updateData))
      .eq('id', id)
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

    return createSuccessResponse(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return createErrorResponse("Failed to update user");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userContext = await getCurrentUserContext();

    // Only admins can delete users
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    // Check if user exists first
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (getUserError && getUserError.code === 'PGRST116') {
      return createErrorResponse("User not found", 404);
    }

    if (getUserError) {
      return handleDatabaseError(getUserError);
    }

    // Soft delete the user by setting is_active to false
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return createErrorResponse("Failed to delete user");
  }
}
