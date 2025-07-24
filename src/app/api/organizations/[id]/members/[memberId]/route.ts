import { NextRequest, NextResponse } from "next/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
  addTimestamps,
} from "@/src/lib/api-utils";
import { OrganizationMember } from "@/src/types/user";

type RouteParams = {
  params: Promise<{ id: string; memberId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId, memberId } = await params;
    const db = await getDbData();

    const member = db["organization-members"]?.find(
      (member: OrganizationMember) =>
        member.id === memberId && member.organizationId === organizationId
    );

    if (!member) {
      return createErrorResponse("Member not found", 404);
    }

    return createSuccessResponse(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    return createErrorResponse("Failed to fetch member");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId, memberId } = await params;
    const db = await getDbData();
    const updatedData = await request.json();

    const memberIndex = db["organization-members"]?.findIndex(
      (member: OrganizationMember) =>
        member.id === memberId && member.organizationId === organizationId
    );

    if (memberIndex === -1 || memberIndex === undefined) {
      return createErrorResponse("Member not found", 404);
    }

    // Update the member while preserving original data
    db["organization-members"][memberIndex] = addTimestamps({
      ...db["organization-members"][memberIndex],
      ...updatedData,
    });

    await writeDbData(db);

    return createSuccessResponse(db["organization-members"][memberIndex]);
  } catch (error) {
    console.error("Error updating member:", error);
    return createErrorResponse("Failed to update member");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId, memberId } = await params;
    const db = await getDbData();

    const memberIndex = db["organization-members"]?.findIndex(
      (member: OrganizationMember) =>
        member.id === memberId && member.organizationId === organizationId
    );

    if (memberIndex === -1 || memberIndex === undefined) {
      return createErrorResponse("Member not found", 404);
    }

    // Remove member from organization
    db["organization-members"].splice(memberIndex, 1);
    await writeDbData(db);

    return createSuccessResponse({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    return createErrorResponse("Failed to remove member");
  }
}
