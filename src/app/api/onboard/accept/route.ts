import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
} from "../../../../lib/api-utils";
import { PendingInvitation } from "@/src/types";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { token } = await request.json();

    if (!token) {
      return createErrorResponse("Token is required", 400);
    }

    const db = await getDbData();

    if (!db["pending-invitations"]) {
      db["pending-invitations"] = [];
    }

    // Find invitation by token - skip email matching
    const invitation = db["pending-invitations"].find(
      (inv: PendingInvitation) => inv.token === token && inv.status === "pending"
    );

    if (!invitation) {
      return createErrorResponse("Invalid or expired invitation", 404);
    }

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return createErrorResponse("Invitation has expired", 400);
    }

    // Auto-assign organization details to all users
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        unsafeMetadata: {
          organizationId: invitation.organizationId,
          organizationRole: invitation.organizationRole,
        },
      });
    } catch (clerkError) {
      console.error("Failed to update user metadata:", clerkError);
      return createErrorResponse("Failed to update user profile", 500);
    }

    // Mark invitation as accepted
    invitation.status = "accepted";
    invitation.acceptedAt = new Date().toISOString();
    invitation.acceptedBy = userId;

    await writeDbData(db);

    return createSuccessResponse({
      message: "Invitation accepted successfully",
      organizationId: invitation.organizationId,
      organizationName: invitation.organizationName,
      role: invitation.organizationRole,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return createErrorResponse("Failed to accept invitation", 500);
  }
}
