import { NextRequest, NextResponse } from "next/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
  addTimestamps,
  generateId,
} from "@/src/lib/api-utils";
import { InviteRequest } from "@/src/types/user";

export async function GET(request: NextRequest) {
  try {
    const db = await getDbData();

    if (!db.invites) {
      db.invites = [];
    }

    return createSuccessResponse(db.invites);
  } catch (error) {
    console.error("Error fetching invites:", error);
    return createErrorResponse("Failed to fetch invites");
  }
}

export async function POST(request: NextRequest) {
  try {
    const inviteData = await request.json();
    const db = await getDbData();

    if (!db.invites) {
      db.invites = [];
    }

    // Check if user already has a pending invite
    const existingInvite = db.invites.find(
      (invite: InviteRequest) =>
        invite.email === inviteData.email &&
        invite.organizationId === inviteData.organizationId &&
        invite.status === "pending"
    );

    if (existingInvite) {
      return createErrorResponse("User already has a pending invitation", 409);
    }

    const token = generateId("token");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const newInvite: InviteRequest = addTimestamps({
      id: generateId("invite"),
      ...inviteData,
      status: "pending",
      token,
      expiresAt: expiresAt.toISOString(),
    });

    db.invites.push(newInvite);
    await writeDbData(db);

    return createSuccessResponse(newInvite, 201);
  } catch (error) {
    console.error("Error sending invite:", error);
    return createErrorResponse("Failed to send invite");
  }
}
