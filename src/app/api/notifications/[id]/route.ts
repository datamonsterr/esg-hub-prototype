import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
  sanitizeData,
  addUpdateTimestamp,
} from "@/src/lib/supabase-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userContext = await getCurrentUserContext();
    const notificationId = parseInt(params.id);

    if (isNaN(notificationId)) {
      return createErrorResponse("Invalid notification ID", 400);
    }

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('organization_id', userContext.organizationId)
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    if (!notification) {
      return createErrorResponse("Notification not found", 404);
    }

    return createSuccessResponse(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    return createErrorResponse("Failed to fetch notification");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userContext = await getCurrentUserContext();
    const notificationId = parseInt(params.id);
    const updates = await request.json();

    if (isNaN(notificationId)) {
      return createErrorResponse("Invalid notification ID", 400);
    }

    // Check if notification exists and belongs to user's organization
    const { data: existingNotification, error: fetchError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('organization_id', userContext.organizationId)
      .single();

    if (fetchError) {
      return handleDatabaseError(fetchError);
    }

    if (!existingNotification) {
      return createErrorResponse("Notification not found", 404);
    }

    // Sanitize and add update timestamps
    const notificationData = addUpdateTimestamp(sanitizeData(updates));

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .update(notificationData)
      .eq('id', notificationId)
      .eq('organization_id', userContext.organizationId)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return createErrorResponse("Failed to update notification");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userContext = await getCurrentUserContext();
    const notificationId = parseInt(params.id);

    if (isNaN(notificationId)) {
      return createErrorResponse("Invalid notification ID", 400);
    }

    // Check if notification exists and belongs to user's organization
    const { data: existingNotification, error: fetchError } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .eq('id', notificationId)
      .eq('organization_id', userContext.organizationId)
      .single();

    if (fetchError) {
      return handleDatabaseError(fetchError);
    }

    if (!existingNotification) {
      return createErrorResponse("Notification not found", 404);
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('organization_id', userContext.organizationId);

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return createErrorResponse("Failed to delete notification");
  }
}
