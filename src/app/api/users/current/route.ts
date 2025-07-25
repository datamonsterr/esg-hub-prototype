import { NextRequest } from "next/server";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserWithoutCreating,
} from "@/src/lib/supabase-utils";

export async function GET(request: NextRequest) {
  try {
    const userContext = await getCurrentUserWithoutCreating();
    
    // If user doesn't exist in database, return appropriate response for onboarding
    if (!userContext.exists) {
      return createSuccessResponse({
        id: userContext.userId,
        email: userContext.email,
        organizationId: null,
        organizationRole: null,
        isActive: false,
        organization: null,
        needsOnboarding: true
      });
    }
    
    return createSuccessResponse({
      id: userContext.userId,
      email: userContext.email,
      organizationId: userContext.organizationId,
      organizationRole: userContext.organizationRole,
      isActive: userContext.isActive,
      organization: userContext.organization,
      needsOnboarding: false
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return createErrorResponse("Failed to get current user");
  }
}