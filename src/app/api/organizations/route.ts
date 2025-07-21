import { NextRequest, NextResponse } from "next/server";
import { Organization } from "@/src/types/user";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
  generateId,
  addTimestamps,
  processQueryParams,
} from "@/src/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const db = await getDbData();
    const searchParams = request.nextUrl.searchParams;

    let organizations = db.organizations || [];
    organizations = processQueryParams(organizations, searchParams);

    return createSuccessResponse(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return createErrorResponse("Failed to fetch organizations");
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDbData();
    const newOrganization = await request.json();

    // Generate ID if not provided
    if (!newOrganization.id) {
      newOrganization.id = generateId("org");
    }

    // Add timestamps
    const organizationWithTimestamps = addTimestamps(newOrganization);

    if (!db.organizations) {
      db.organizations = [];
    }

    db.organizations.push(organizationWithTimestamps);
    await writeDbData(db);

    return createSuccessResponse(organizationWithTimestamps, 201);
  } catch (error) {
    console.error("Error creating organization:", error);
    return createErrorResponse("Failed to create organization");
  }
}
