import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
  sanitizeData,
} from "@/src/lib/supabase-utils";
import { updateUser, deleteUser, getUserById } from "@/src/lib/user-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userContext = await getCurrentUserContext();

    // Users can only access their own data or admins can access any
    if (userContext.userId !== id && userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied", 403);
    }

    const user = await getUserById(id);

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
    const userContext = await getCurrentUserContext();
    const updatedData = await request.json();

    // Users can only update their own data or admins can update any
    if (userContext.userId !== id && userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied", 403);
    }

    // Get the user to get their clerk_id
    const user = await getUserById(id);
    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    // Extract only the allowed fields for update
    const allowedFields = ['organization_role'];
    const filteredData = Object.keys(updatedData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updatedData[key];
        return obj;
      }, {} as any);

    // Only admins can update organization_role
    if (filteredData.organization_role && userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required to update user role", 403);
    }

    const updatedUser = await updateUser(user.clerk_id, sanitizeData(filteredData));

    return createSuccessResponse(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return createErrorResponse("Failed to update user");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userContext = await getCurrentUserContext();

    // Only admins can delete users
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    // Get the user to get their clerk_id
    const user = await getUserById(id);
    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    // Soft delete the user
    await deleteUser(user.clerk_id);

    return createSuccessResponse({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return createErrorResponse("Failed to delete user");
  }
}
