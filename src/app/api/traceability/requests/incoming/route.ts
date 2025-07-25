import { NextRequest, NextResponse } from "next/server";
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
    const searchParams = request.nextUrl.searchParams;

    // Get incoming traceability requests (where current org is the target)
    let query = supabaseAdmin
      .from('trace_requests')
      .select(`
        *,
        requesting_organization:requesting_organization_id (
          id,
          name,
          email,
          address
        ),
        target_organization:target_organization_id (
          id,
          name,
          email,
          address
        ),
        assessment:assessment_id (
          id,
          title,
          description,
          status,
          priority
        )
      `)
      .eq('target_organization_id', userContext.organizationId);

    // Apply filters, sorting, and pagination
    const allowedFilters = ['status', 'priority', 'requesting_organization_id'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: requests, error } = await query;
    console.log(requests)
    
    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(requests);
  } catch (error) {
    console.error("Error fetching incoming traceability requests:", error);
    return createErrorResponse("Failed to fetch incoming traceability requests");
  }
}
