import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
  sanitizeData,
  addCreateTimestamps,
} from "@/src/lib/supabase-utils";

export async function POST(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    
    // Only admins can create users manually
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    const { clerkId, organizationId, organizationRole = 'member' } = await request.json();

    if (!clerkId) {
      return createErrorResponse("Clerk ID is required", 400);
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();

    if (existingUser) {
      return createErrorResponse("User already exists", 409);
    }

    // Validate organization exists if provided
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      targetOrgId = userContext.organizationId; // Default to current user's org
    } else {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('id', targetOrgId)
        .single();

      if (!org) {
        return createErrorResponse("Organization not found", 404);
      }
    }

    // Create the user
    const userToCreate = {
      id: clerkId,
      organization_id: targetOrgId,
      organization_role: organizationRole || 'employee',
      is_active: true,
    };

    const sanitizedUser = sanitizeData(userToCreate);
    const userWithTimestamps = addCreateTimestamps(sanitizedUser);

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert(userWithTimestamps)
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

    return createSuccessResponse(newUser, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return createErrorResponse("Failed to create user");
  }
}
