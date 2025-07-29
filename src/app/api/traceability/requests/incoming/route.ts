import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  processQueryParams,
  handleDatabaseError,
} from "@/src/lib/supabase-utils";
import { transformFromDb } from "@/src/types/server-transforms";

export async function GET(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const searchParams = request.nextUrl.searchParams;

    // Get incoming traceability requests (where current org is the target)
    let query = supabaseAdmin
      .from('trace_requests')
      .select(`
        *,
        requesting_organization:organizations!requesting_organization_id (
          id,
          name,
          email,
          address,
          created_at
        ),
        target_organization:organizations!target_organization_id (
          id,
          name,
          email,
          address,
          created_at
        ),
        assessment:assessments!assessment_id (
          id,
          title,
          description,
          status,
          priority,
          due_date,
          created_at,
          updated_at
        )
      `)
      .eq('target_organization_id', userContext.organizationId);

    // Apply filters, sorting, and pagination
    const allowedFilters = ['status', 'priority', 'requesting_organization_id'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: requests, error } = await query;
    
    if (error) {
      return handleDatabaseError(error);
    }

    // Transform the data using proper transformation functions
    const transformedRequests = requests?.map((request: any) => ({
      ...(transformFromDb(request) as any),
      requestingOrganization: request.requesting_organization ? transformFromDb(request.requesting_organization) : null,
      targetOrganization: request.target_organization ? transformFromDb(request.target_organization) : null,
      assessment: request.assessment ? transformFromDb(request.assessment) : null
    })) || [];

    return createSuccessResponse(transformedRequests);
  } catch (error) {
    console.error("Error fetching incoming traceability requests:", error);
    return createErrorResponse("Failed to fetch incoming traceability requests");
  }
}
