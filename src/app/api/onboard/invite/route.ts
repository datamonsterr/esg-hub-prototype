import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  processQueryParams,
  handleDatabaseError,
} from "@/src/lib/supabase-utils";

export async function GET(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();

    // Verify the user is an admin
    if (userContext.organizationRole !== "admin") {
      return createErrorResponse(
        "Forbidden: Only organization admins can view invitations",
        403
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Get organization invites from Supabase
    let query = supabaseAdmin
      .from('organization_invites')
      .select(`
        id,
        email,
        organization_id,
        organization_role,
        invited_by,
        status,
        expires_at,
        created_at,
        organizations:organization_id (
          id,
          name
        )
      `)
      .eq('organization_id', userContext.organizationId);

    // Apply filters, sorting, and pagination
    const allowedFilters = ['status', 'organization_role', 'email'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: invitations, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(invitations || []);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
