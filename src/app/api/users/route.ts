import { NextRequest, NextResponse } from "next/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
  addTimestamps,
  generateId,
  processQueryParams,
} from "@/src/lib/api-utils";
import { UserProfile } from "@/src/types/user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const db = await getDbData();

    if (!db.users) {
      db.users = [];
    }

    const users = processQueryParams(db.users, searchParams);
    return createSuccessResponse(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return createErrorResponse("Failed to fetch users");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const db = await getDbData();

    if (!db.users) {
      db.users = [];
    }

    // Check if user already exists
    const existingUser = db.users.find(
      (user: UserProfile) => user.email === userData.email
    );
    if (existingUser) {
      return createErrorResponse("User already exists", 409);
    }

    const newUser: UserProfile = addTimestamps({
      id: generateId("user"),
      ...userData,
      isActive: userData.isActive ?? true,
    });

    db.users.push(newUser);
    await writeDbData(db);

    return createSuccessResponse(newUser, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return createErrorResponse("Failed to create user");
  }
}
