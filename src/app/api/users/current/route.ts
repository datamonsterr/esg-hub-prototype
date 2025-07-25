import { NextRequest } from "next/server";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
} from "@/src/lib/supabase-utils";

export async function GET(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    
    return createSuccessResponse({
      id: userContext.userId,
      email: userContext.email,
      organizationId: userContext.organizationId,
      organizationRole: userContext.organizationRole,
      isActive: userContext.isActive,
      organization: userContext.organization
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return createErrorResponse("Failed to get current user");
  }
}