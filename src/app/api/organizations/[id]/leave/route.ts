import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = params.id;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Verify the user is a member of the organization
    // 2. Check if they're not the only admin (business logic)
    // 3. Remove the user from the organization
    // 4. Clean up any user-specific organization data

    // For now, we'll return success as Clerk handles the actual membership removal
    // on the client side via organizationMembership.destroy()

    return NextResponse.json({
      message: "Successfully left organization",
      organizationId,
      userId,
    });
  } catch (error) {
    console.error("Error leaving organization:", error);
    return NextResponse.json(
      { error: "Failed to leave organization" },
      { status: 500 }
    );
  }
}
