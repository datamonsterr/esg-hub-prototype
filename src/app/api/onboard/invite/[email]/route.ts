import { NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
  generateId,
  addTimestamps,
} from "../../../../../lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Verify the user is an admin
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userMetadata = user.publicMetadata || {};

    if (userMetadata.organizationRole !== "admin") {
      return createErrorResponse(
        "Forbidden: Only organization admins can send invitations",
        403
      );
    }

    const { email } = params;
    const body = await request.json();
    const { organizationRole = "employee", expiresInDays = 7 } = body;

    if (!email) {
      return createErrorResponse("Email is required", 400);
    }

    // Decode email from URL parameter
    const decodedEmail = decodeURIComponent(email);

    if (!["admin", "employee"].includes(organizationRole)) {
      return createErrorResponse("Invalid organization role", 400);
    }

    // Get database data
    const db = await getDbData();
    const invitations = db["pending-invitations"] || [];

    // Check if there's already a pending invitation for this email in this organization
    const existingInvitation = invitations.find(
      (inv: any) =>
        inv.email === decodedEmail &&
        inv.organizationId === userMetadata.organizationId &&
        inv.status === "pending"
    );

    if (existingInvitation) {
      return createErrorResponse(
        "An invitation for this email already exists",
        400
      );
    }

    // Generate invitation
    const invitation = addTimestamps({
      id: generateId("inv"),
      email: decodedEmail,
      organizationId: userMetadata.organizationId,
      organizationName: userMetadata.organizationName,
      organizationRole,
      status: "pending",
      token: generateId("token"),
      invitedBy: userId,
      expiresAt: new Date(
        Date.now() + expiresInDays * 24 * 60 * 60 * 1000
      ).toISOString(),
    });

    // Add to database
    invitations.push(invitation);
    await writeDbData(db);

    // In a real application, you would send an email here
    // For now, we'll just return the invitation details
    return createSuccessResponse(
      {
        id: invitation.id,
        email: invitation.email,
        organizationName: invitation.organizationName,
        organizationRole: invitation.organizationRole,
        expiresAt: invitation.expiresAt,
        message: "Invitation sent successfully",
      },
      201
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Verify the user is an admin
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userMetadata = user.publicMetadata || {};

    if (userMetadata.organizationRole !== "admin") {
      return createErrorResponse(
        "Forbidden: Only organization admins can view invitations",
        403
      );
    }

    const { email } = params;
    const decodedEmail = decodeURIComponent(email);

    // Get database data
    const db = await getDbData();
    const allInvitations = db["pending-invitations"] || [];

    // Filter invitations for the specific email in the admin's organization
    const emailInvitations = allInvitations.filter(
      (inv: any) =>
        inv.email === decodedEmail &&
        inv.organizationId === userMetadata.organizationId
    );

    // Remove sensitive data like tokens
    const processedInvitations = emailInvitations.map((inv: any) => ({
      ...inv,
      token: undefined,
    }));

    return createSuccessResponse(processedInvitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Verify the user is an admin
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userMetadata = user.publicMetadata || {};

    if (userMetadata.organizationRole !== "admin") {
      return createErrorResponse(
        "Forbidden: Only organization admins can revoke invitations",
        403
      );
    }

    const { email } = params;
    const decodedEmail = decodeURIComponent(email);

    // Get database data
    const db = await getDbData();
    const invitations = db["pending-invitations"] || [];

    // Find pending invitations for this email in the admin's organization
    const invitationIndex = invitations.findIndex(
      (inv: any) =>
        inv.email === decodedEmail &&
        inv.organizationId === userMetadata.organizationId &&
        inv.status === "pending"
    );

    if (invitationIndex === -1) {
      return createErrorResponse(
        "No pending invitation found for this email",
        404
      );
    }

    // Remove the invitation
    invitations.splice(invitationIndex, 1);
    await writeDbData(db);

    return createSuccessResponse({
      message: "Invitation revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking invitation:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
