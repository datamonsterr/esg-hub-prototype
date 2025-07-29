import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  processQueryParams,
  validateRequiredFields,
  handleDatabaseError,
  sanitizeData,
  addCreateTimestamps,
} from "@/src/lib/supabase-utils";

export async function GET(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const searchParams = request.nextUrl.searchParams;

    // Only allow admins to list all users, otherwise only return current user
    let query = supabaseAdmin
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
          email
        )
      `);

    // If not admin, only show users from same organization
    if (userContext.organizationRole !== 'admin') {
      query = query.eq('organization_id', userContext.organizationId);
    }

    // Apply filters, sorting, and pagination
    const allowedFilters = ['organization_role', 'is_active'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: users, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return createErrorResponse("Failed to fetch users");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    
    // Only admins can create users
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    const userData = await request.json();

    // Validate required fields
    validateRequiredFields(userData, ['clerkId', 'organizationId']);

    // Transform camelCase to snake_case for database
    const userToCreate = {
      id: userData.clerkId,
      organization_id: userData.organizationId,
      organization_role: userData.organizationRole || 'employee',
      is_active: userData.isActive !== false, // Default to true
    };

    // Sanitize data
    const sanitizedUser = sanitizeData(userToCreate);
    const userWithTimestamps = addCreateTimestamps(sanitizedUser);

    const { data: user, error } = await supabaseAdmin
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

    return createSuccessResponse(user, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return createErrorResponse("Failed to create user");
  }
}
