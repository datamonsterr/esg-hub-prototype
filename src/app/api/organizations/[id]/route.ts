import { NextRequest, NextResponse } from "next/server";
import { Organization } from "@/src/types/user";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
  addTimestamps,
} from "@/src/lib/api-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();

    const organization = db.organizations?.find(
      (org: Organization) => org.id === id
    );

    if (!organization) {
      return createErrorResponse("Organization not found", 404);
    }

    return createSuccessResponse(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return createErrorResponse("Failed to fetch organization");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();
    const updatedData = await request.json();

    const orgIndex = db.organizations?.findIndex(
      (org: Organization) => org.id === id
    );

    if (orgIndex === -1 || orgIndex === undefined) {
      return createErrorResponse("Organization not found", 404);
    }

    // Update the organization while preserving original data
    db.organizations[orgIndex] = addTimestamps({
      ...db.organizations[orgIndex],
      ...updatedData,
      id, // Ensure ID doesn't change
    });

    await writeDbData(db);

    return createSuccessResponse(db.organizations[orgIndex]);
  } catch (error) {
    console.error("Error updating organization:", error);
    return createErrorResponse("Failed to update organization");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();

    const orgIndex = db.organizations?.findIndex(
      (org: Organization) => org.id === id
    );

    if (orgIndex === -1 || orgIndex === undefined) {
      return createErrorResponse("Organization not found", 404);
    }

    const deletedOrg = db.organizations.splice(orgIndex, 1)[0];
    await writeDbData(db);

    return createSuccessResponse({
      message: "Organization deleted successfully",
      organization: deletedOrg,
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return createErrorResponse("Failed to delete organization");
  }
}
