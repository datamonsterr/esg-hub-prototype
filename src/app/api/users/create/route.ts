import { NextRequest, NextResponse } from "next/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
  addTimestamps,
  generateId,
} from "@/src/lib/api-utils";
import { UserProfile, OrganizationMember } from "@/src/types/user";

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, clerkUserId } = await request.json();
    const db = await getDbData();

    if (!db.users) {
      db.users = [];
    }
    if (!db["organization-members"]) {
      db["organization-members"] = [];
    }

    // Check if user already exists
    const existingUser = db.users.find(
      (user: UserProfile) => user.email === email
    );
    if (existingUser) {
      return createSuccessResponse(existingUser);
    }

    // Create user profile
    const newUser: UserProfile = addTimestamps({
      id: generateId("user"),
      email,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      imageUrl: null,
      organizationId: "org-nuoa", // Auto-assign to Nuoa
      organizationRole: "employee",
      isActive: true,
      joinedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });

    // Create organization membership
    const newMember: OrganizationMember = addTimestamps({
      id: generateId("member"),
      userId: newUser.id,
      organizationId: "org-nuoa",
      role: "employee",
      status: "active",
      joinedAt: new Date().toISOString(),
      permissions: ["read", "write"],
    });

    // Add to database
    db.users.push(newUser);
    db["organization-members"].push(newMember);

    await writeDbData(db);

    return createSuccessResponse({ user: newUser, member: newMember }, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return createErrorResponse("Failed to create user");
  }
}
