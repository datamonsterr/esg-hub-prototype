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

    // Get outgoing traceability requests (where current org is the requester)
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
      .eq('requesting_organization_id', userContext.organizationId);

    // Apply filters, sorting, and pagination
    const allowedFilters = ['status', 'priority', 'target_organization_id'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: requests, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(requests);
  } catch (error) {
    console.error("Error fetching outgoing traceability requests:", error);
    return createErrorResponse("Failed to fetch outgoing traceability requests");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const newRequest = await request.json();

    // Validate required fields
    validateRequiredFields(newRequest, ['target_organization_id', 'assessment_id']);

    // Set requesting organization from user context
    newRequest.requesting_organization_id = userContext.organizationId;

    // Set default values
    if (!newRequest.status) {
      newRequest.status = 'pending';
    }
    if (!newRequest.priority) {
      newRequest.priority = 'medium';
    }
    if (!newRequest.cascade_settings) {
      newRequest.cascade_settings = {};
    }

    // Sanitize and add timestamps
    const requestData = addCreateTimestamps(sanitizeData(newRequest));

    const { data: traceRequest, error } = await supabaseAdmin
      .from('trace_requests')
      .insert(requestData)
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
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(traceRequest, 201);
  } catch (error) {
    console.error("Error creating traceability request:", error);
    return createErrorResponse("Failed to create traceability request");
  }
}
