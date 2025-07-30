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
} from "@/src/lib/supabase-utils";

export async function GET(request: NextRequest) {
  try {
    // Get current user context for access control
    const userContext = await getCurrentUserContext();
    
    const searchParams = request.nextUrl.searchParams;
    
    // Start with base query - filter by user's organization
    let query = supabaseAdmin
      .from('integration_activities')
      .select('*')
      .eq('organization_id', userContext.organizationId);

    // Apply filters, sorting, and pagination
    const allowedFilters = ['title', 'subtitle', 'status'];
    query = processQueryParams(query, searchParams, allowedFilters);

    // Default ordering by created_at desc
    if (!searchParams.has('order')) {
      query = query.order('created_at', { ascending: false });
    }

    const { data: activities, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(activities);
  } catch (error) {
    console.error("Error fetching integration activities:", error);
    return createErrorResponse("Failed to fetch integration activities");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const newActivity = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'status'];
    validateRequiredFields(newActivity, requiredFields);

    // Explicitly reject id field in POST requests (should be auto-generated)
    if ('id' in newActivity) {
      return createErrorResponse("ID field is not allowed in POST requests. IDs are auto-generated.", 400);
    }

    // Sanitize and prepare data
    const sanitizedActivity = sanitizeData(newActivity);

    // Filter only allowed fields (exclude id to let database auto-generate)
    const allowedFields = ['title', 'subtitle', 'status'];
    const filteredActivity = Object.keys(sanitizedActivity)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = sanitizedActivity[key];
        return obj;
      }, {} as any);

    // Add organization context and timestamp (integration_activities only has created_at)
    const activityToInsert = {
      ...filteredActivity,
      organization_id: userContext.organizationId,
      created_at: new Date().toISOString()
    };

    // Validate status values
    const validStatuses = ['success', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(activityToInsert.status)) {
      return createErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    

    const { data: createdActivity, error } = await supabaseAdmin
      .from('integration_activities')
      .insert(activityToInsert)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return handleDatabaseError(error);
    }

    return createSuccessResponse(createdActivity, 201);
  } catch (error) {
    console.error("Error creating integration activity:", error);
    return createErrorResponse("Failed to create integration activity");
  }
}
