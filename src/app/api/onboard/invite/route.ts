import { NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  getDbData,
  createErrorResponse,
  createSuccessResponse,
} from "../../../../lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Verify the user is an admin
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userMetadata = user.unsafeMetadata || {};

    if (userMetadata.organizationRole !== "admin") {
      return createErrorResponse(
        "Forbidden: Only organization admins can view invitations",
        403
      );
    }

    const { searchParams } = new URL(request.url);

    // Get database data
    const db = await getDbData();
    const allInvitations = db["pending-invitations"] || [];

    // Filter invitations for the admin's organization
    const organizationInvitations = allInvitations.filter(
      (inv: any) => inv.organizationId === userMetadata.organizationId
    );

    // Apply query parameters (sorting, pagination, etc.)
    const processedInvitations = organizationInvitations.map((inv: any) => ({
      ...inv,
      token: undefined, // Don't expose tokens in list responses
    }));

    return createSuccessResponse(processedInvitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
