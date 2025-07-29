import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  checkOrganizationAccess,
  processQueryParams,
  validateRequiredFields,
  handleDatabaseError,
  sanitizeData,
  addCreateTimestamps,
} from "@/src/lib/supabase-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId } = await params;
    const userContext = await checkOrganizationAccess(organizationId);
    const searchParams = request.nextUrl.searchParams;

    // Get organization members from users table
    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        organization_id,
        organization_role,
        is_active
      `)
      .eq('organization_id', organizationId);

    // Apply filters, sorting, and pagination
    const allowedFilters = ['organization_role', 'is_active'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: members, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(members || []);
  } catch (error) {
    console.error("Error fetching organization members:", error);
    return createErrorResponse("Failed to fetch organization members");
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId } = await params;
    const userContext = await checkOrganizationAccess(organizationId);
    const memberData = await request.json();

    // Only admins can add members
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    // Validate required fields
    validateRequiredFields(memberData, ['clerkId']);

    // Check if member already exists
    const { data: existingMember, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', memberData.clerkId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return handleDatabaseError(checkError);
    }

    if (existingMember) {
      return createErrorResponse(
        "User is already a member of an organization",
        409
      );
    }

    // Create new user record
    const userToCreate = {
      id: memberData.clerkId,
      organization_id: organizationId,
      organization_role: memberData.organizationRole || 'employee',
      is_active: memberData.isActive !== false, // Default to true
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
    console.error("Error adding organization member:", error);
    return createErrorResponse("Failed to add organization member");
  }
}
