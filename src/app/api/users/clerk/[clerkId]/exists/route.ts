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
 * Check if user exists by Clerk ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { clerkId } = await params;
    const userContext = await getCurrentUserContext();

    // Users can only check their own existence or admins can check any
    if (userContext.userId !== clerkId && userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied", 403);
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', clerkId)
      .single();

    if (error && error.code === 'PGRST116') {
      return createSuccessResponse({ exists: false });
    }

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse({ exists: !!data });
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return createErrorResponse("Failed to check user existence");
  }
}
