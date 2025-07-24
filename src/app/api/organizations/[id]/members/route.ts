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
import { OrganizationMember } from "@/src/types/user";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId } = await params;
    const { searchParams } = new URL(request.url);
    const db = await getDbData();

    if (!db["organization-members"]) {
      db["organization-members"] = [];
    }

    // Filter members by organization
    const organizationMembers = db["organization-members"].filter(
      (member: OrganizationMember) => member.organizationId === organizationId
    );

    const members = processQueryParams(organizationMembers, searchParams);
    return createSuccessResponse(members);
  } catch (error) {
    console.error("Error fetching organization members:", error);
    return createErrorResponse("Failed to fetch organization members");
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId } = await params;
    const memberData = await request.json();
    const db = await getDbData();

    if (!db["organization-members"]) {
      db["organization-members"] = [];
    }

    // Check if member already exists
    const existingMember = db["organization-members"].find(
      (member: OrganizationMember) =>
        member.userId === memberData.userId &&
        member.organizationId === organizationId
    );

    if (existingMember) {
      return createErrorResponse(
        "User is already a member of this organization",
        409
      );
    }

    const newMember: OrganizationMember = addTimestamps({
      id: generateId("member"),
      organizationId,
      ...memberData,
      status: memberData.status || "active",
      permissions: memberData.permissions || [],
    });

    db["organization-members"].push(newMember);
    await writeDbData(db);

    return createSuccessResponse(newMember, 201);
  } catch (error) {
    console.error("Error adding organization member:", error);
    return createErrorResponse("Failed to add organization member");
  }
}
