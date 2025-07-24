import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
  processQueryParams,
  generateId,
} from "../../../../lib/api-utils";
import { PendingInvitation } from "@/src/types/user";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email") || "";

    // Get database data
    const db = await getDbData();
    const allInvitations = db["pending-invitations"] || [];

    // Helper function to check if email matches pattern (including wildcards)
    const emailMatches = (inviteEmail: string, userEmail: string) => {
      if (inviteEmail === userEmail) return true;

      // Handle wildcard patterns like "*@gmail.com"
      if (inviteEmail.includes("*")) {
        const pattern = inviteEmail.replace("*", ".*");
        const regex = new RegExp(`^${pattern}$`, "i");
        return regex.test(userEmail);
      }

      return false;
    };

    // Filter invitations for the current user
    const userInvitations = allInvitations.filter((inv: any) => {
      return (
        inv.status === "pending" &&
        (inv.invitedUserId === userId || emailMatches(inv.email, userEmail))
      );
    });

    // Apply query parameters (sorting, pagination, etc.)
    const processedInvitations = processQueryParams(
      userInvitations,
      searchParams
    );

    return createSuccessResponse(processedInvitations);
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// Auto-create invitation for new users
export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json();

    const db = await getDbData();

    if (!db["pending-invitations"]) {
      db["pending-invitations"] = [];
    }

    // Check if user already has a pending invitation
    const existingInvite = db["pending-invitations"].find(
      (invitation: PendingInvitation) => invitation.email === email
    );

    if (existingInvite) {
      return createSuccessResponse(existingInvite);
    }

    // Auto-create invitation to Nuoa.io for testing
    const nuoaOrg = db.organizations.find((org: any) => org.id === "org-nuoa");
    if (!nuoaOrg) {
      return createErrorResponse("Nuoa organization not found", 404);
    }

    const token = generateId("invite-token");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const newInvitation: PendingInvitation = {
      id: generateId("pending-inv"),
      email,
      organizationId: "org-nuoa",
      organizationName: "Nuoa.io",
      organizationRole: "employee",
      invitedBy: {
        name: "Dat Pham",
        email: "dat.pham@nuoa.io",
      },
      status: "pending",
      token,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    db["pending-invitations"].push(newInvitation);
    await writeDbData(db);

    return createSuccessResponse(newInvitation, 201);
  } catch (error) {
    console.error("Error creating pending invitation:", error);
    return createErrorResponse("Failed to create pending invitation");
  }
}
