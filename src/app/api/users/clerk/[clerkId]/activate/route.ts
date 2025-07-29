import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
} from "@/src/lib/supabase-utils";

type RouteParams = {
  params: Promise<{ clerkId: string }>;
};

/**
 * Activate user
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { clerkId } = await params;
    const userContext = await getCurrentUserContext();

    // Only admins can activate users
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', clerkId)
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

    return createSuccessResponse(data);
  } catch (error) {
    console.error("Error activating user:", error);
    return createErrorResponse("Failed to activate user");
  }
}
