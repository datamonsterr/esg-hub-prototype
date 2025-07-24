import { NextRequest, NextResponse } from "next/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
  addTimestamps,
} from "@/src/lib/api-utils";
import { UserProfile } from "@/src/types/user";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();

    const user = db.users?.find((user: UserProfile) => user.id === id);

    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    return createSuccessResponse(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return createErrorResponse("Failed to fetch user");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();
    const updatedData = await request.json();

    const userIndex = db.users?.findIndex(
      (user: UserProfile) => user.id === id
    );

    if (userIndex === -1 || userIndex === undefined) {
      return createErrorResponse("User not found", 404);
    }

    // Update the user while preserving original data
    db.users[userIndex] = addTimestamps({
      ...db.users[userIndex],
      ...updatedData,
    });

    await writeDbData(db);

    return createSuccessResponse(db.users[userIndex]);
  } catch (error) {
    console.error("Error updating user:", error);
    return createErrorResponse("Failed to update user");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();

    const userIndex = db.users?.findIndex(
      (user: UserProfile) => user.id === id
    );

    if (userIndex === -1 || userIndex === undefined) {
      return createErrorResponse("User not found", 404);
    }

    // Remove user from users array
    db.users.splice(userIndex, 1);

    // Also remove from organization members
    if (db["organization-members"]) {
      db["organization-members"] = db["organization-members"].filter(
        (member: any) => member.userId !== id
      );
    }

    await writeDbData(db);

    return createSuccessResponse({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return createErrorResponse("Failed to delete user");
  }
}
