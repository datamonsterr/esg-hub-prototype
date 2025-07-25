import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  validateRequiredFields,
  handleDatabaseError,
  sanitizeData,
} from "@/src/lib/supabase-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userContext = await getCurrentUserContext();
    const activityId = params.id;

    // Validate ID is a number
    if (isNaN(Number(activityId))) {
      return createErrorResponse("Invalid activity ID", 400);
    }

    const { data: activity, error } = await supabaseAdmin
      .from('integration_activities')
      .select('*')
      .eq('id', activityId)
      .eq('organization_id', userContext.organizationId) // Ensure user can only access their org's activities
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(activity);
  } catch (error) {
    console.error("Error fetching integration activity:", error);
    return createErrorResponse("Failed to fetch integration activity");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userContext = await getCurrentUserContext();
    const activityId = params.id;
    const updateData = await request.json();

    // Validate ID is a number
    if (isNaN(Number(activityId))) {
      return createErrorResponse("Invalid activity ID", 400);
    }

    // Sanitize and prepare data
    const sanitizedData = sanitizeData(updateData);

    // Filter only allowed fields for update
    const allowedFields = ['title', 'subtitle', 'status'];
    const filteredData = Object.keys(sanitizedData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = sanitizedData[key];
        return obj;
      }, {} as any);

    // Note: integration_activities table doesn't have updated_at column
    const dataToUpdate = filteredData;

    // Validate status if provided
    if (dataToUpdate.status) {
      const validStatuses = ['success', 'processing', 'completed', 'failed'];
      if (!validStatuses.includes(dataToUpdate.status)) {
        return createErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
    }

    const { data: updatedActivity, error } = await supabaseAdmin
      .from('integration_activities')
      .update(dataToUpdate)
      .eq('id', activityId)
      .eq('organization_id', userContext.organizationId) // Ensure user can only update their org's activities
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(updatedActivity);
  } catch (error) {
    console.error("Error updating integration activity:", error);
    return createErrorResponse("Failed to update integration activity");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userContext = await getCurrentUserContext();
    const activityId = params.id;

    // Validate ID is a number
    if (isNaN(Number(activityId))) {
      return createErrorResponse("Invalid activity ID", 400);
    }

    const { data: deletedActivity, error } = await supabaseAdmin
      .from('integration_activities')
      .delete()
      .eq('id', activityId)
      .eq('organization_id', userContext.organizationId) // Ensure user can only delete their org's activities
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(deletedActivity);
  } catch (error) {
    console.error("Error deleting integration activity:", error);
    return createErrorResponse("Failed to delete integration activity");
  }
}
