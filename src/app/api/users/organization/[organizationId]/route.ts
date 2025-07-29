import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  processQueryParams,
  handleDatabaseError,
} from "@/src/lib/supabase-utils";

type RouteParams = {
  params: Promise<{ organizationId: string }>;
};

/**
 * Get all users for an organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { organizationId } = await params;
    const userContext = await getCurrentUserContext();
    const searchParams = request.nextUrl.searchParams;

    // Users can only access users from their own organization, admins can access any
    if (userContext.organizationId !== organizationId && userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied", 403);
    }

    let query = supabaseAdmin
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
      .eq('organization_id', organizationId);

    // Only show active users by default, unless specifically requested
    const showInactive = searchParams.get('include_inactive') === 'true';
    if (!showInactive) {
      query = query.eq('is_active', true);
    }

    // Apply filters, sorting, and pagination
    const allowedFilters = ['organization_role', 'is_active'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(data || []);
  } catch (error) {
    console.error("Error getting users by organization:", error);
    return createErrorResponse("Failed to get organization users");
  }
}
