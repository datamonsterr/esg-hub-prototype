import { NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
} from "../../../../lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return createErrorResponse("Invitation token is required", 400);
    }

    // Get database data
    const db = await getDbData();
    const invitations = db["pending-invitations"] || [];

    // Find the invitation by token
    const invitationIndex = invitations.findIndex(
      (inv: any) => inv.token === token
    );

    if (invitationIndex === -1) {
      return createErrorResponse("Invitation not found", 404);
    }

    const invitation = invitations[invitationIndex];

    // Check if invitation is already accepted
    if (invitation.status === "accepted") {
      return createErrorResponse("Invitation already accepted", 400);
    }

    // Check if invitation has expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return createErrorResponse("Invitation has expired", 400);
    }

    // Update invitation status
    invitations[invitationIndex] = {
      ...invitation,
      status: "accepted",
      acceptedAt: new Date().toISOString(),
      acceptedBy: userId,
    };

    // Update user's Clerk metadata to assign them to the organization
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const currentMetadata = user.unsafeMetadata || {};

      // Add organization info to user metadata
      const updatedMetadata = {
        ...currentMetadata,
        organizationId: invitation.organizationId,
        organizationRole: invitation.organizationRole,
        organizationName: invitation.organizationName,
      };

      await clerk.users.updateUserMetadata(userId, {
        unsafeMetadata: updatedMetadata,
      });
    } catch (clerkError) {
      console.error("Error updating Clerk metadata:", clerkError);
      return createErrorResponse("Failed to assign user to organization", 500);
    }

    // Save updated data
    await writeDbData(db);

    // Return response matching the AcceptInvitationResponse interface
    return createSuccessResponse({
      organizationId: invitation.organizationId,
      organizationRole: invitation.organizationRole,
      organizationName: invitation.organizationName,
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
