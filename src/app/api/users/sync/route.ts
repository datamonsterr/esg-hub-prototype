// API endpoint for user sync/auto-assignment
import { NextRequest, NextResponse } from "next/server";
import { getDbData, writeDbData } from "@/src/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const { email, organizationId, organizationRole, userData } =
      await request.json();

    const data = await getDbData();

    // Find or create user
    let user = data.users.find((u: any) => u.email === email);

    if (!user) {
      // Create new user
      user = {
        id: `user-${Date.now()}`,
        email,
        firstName: userData?.firstName || "",
        lastName: userData?.lastName || "",
        fullName: userData?.fullName || "",
        imageUrl: userData?.imageUrl || null,
        organizationId,
        organizationRole,
        isActive: true,
        joinedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.users.push(user);
    } else {
      // Update existing user
      user.organizationId = organizationId;
      user.organizationRole = organizationRole;
      user.lastLoginAt = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
      if (userData?.firstName) user.firstName = userData.firstName;
      if (userData?.lastName) user.lastName = userData.lastName;
      if (userData?.fullName) user.fullName = userData.fullName;
      if (userData?.imageUrl) user.imageUrl = userData.imageUrl;
    }

    await writeDbData(data);

    return NextResponse.json({
      success: true,
      user,
      message: "User synced successfully",
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
