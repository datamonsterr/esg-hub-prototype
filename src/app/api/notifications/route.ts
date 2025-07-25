import { NextRequest } from "next/server";
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

    // Start with base query - users can only see their organization's notifications
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('organization_id', userContext.organizationId)
      .order('created_at', { ascending: false });

    // Apply filters, sorting, and pagination
    const allowedFilters = ['type', 'is_read', 'priority'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: notifications, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return createErrorResponse("Failed to fetch notifications");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const newNotification = await request.json();

    // Validate required fields
    validateRequiredFields(newNotification, ['type', 'title', 'message']);

    // Set organization_id from user context
    newNotification.organization_id = userContext.organizationId;

    // Set default values
    if (!newNotification.is_read) {
      newNotification.is_read = false;
    }
    if (!newNotification.priority) {
      newNotification.priority = 'medium';
    }

    // Sanitize and add timestamps
    const notificationData = addCreateTimestamps(sanitizeData(newNotification));

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(notification, 201);
  } catch (error) {
    console.error("Error creating notification:", error);
    return createErrorResponse("Failed to create notification");
  }
}
