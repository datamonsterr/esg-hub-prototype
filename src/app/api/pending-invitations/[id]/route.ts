import { NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
} from "../../../../lib/api-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { id } = params;
    const body = await request.json();
    const { status, acceptedAt } = body;

    if (status !== "accepted") {
      return createErrorResponse("Invalid status", 400);
    }

    // Get database data
    const db = await getDbData();
    const invitations = db["pending-invitations"] || [];

    // Find the invitation
    const invitationIndex = invitations.findIndex((inv: any) => inv.id === id);

    if (invitationIndex === -1) {
      return createErrorResponse("Invitation not found", 404);
    }

    const invitation = invitations[invitationIndex];

    // Check if invitation is already accepted
    if (invitation.status === "accepted") {
      return createErrorResponse("Invitation already accepted", 400);
    }

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return createErrorResponse("Invitation has expired", 400);
    }

    // Update invitation status
    invitations[invitationIndex] = {
      ...invitation,
      status: "accepted",
      acceptedAt: acceptedAt || new Date().toISOString(),
    };

    // Update user's Clerk metadata to assign them to the organization
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const currentMetadata = user.publicMetadata || {};

      // Add organization info to user metadata
      const updatedMetadata = {
        ...currentMetadata,
        organizationId: invitation.organizationId,
        organizationRole: invitation.organizationRole,
        organizationName: invitation.organizationName,
      };

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: updatedMetadata,
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
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const db = await getDbData();
    const invitations = db["pending-invitations"] || [];

    const invitation = invitations.find((inv: any) => inv.id === id);

    if (!invitation) {
      return createErrorResponse("Invitation not found", 404);
    }

    return createSuccessResponse(invitation);
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
