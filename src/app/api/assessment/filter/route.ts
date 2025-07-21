import { NextRequest, NextResponse } from "next/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
} from "@/src/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const db = await getDbData();

    const filters = db["assessment-filters"] || {};

    return createSuccessResponse(filters);
  } catch (error) {
    console.error("Error fetching assessment filters:", error);
    return createErrorResponse("Failed to fetch assessment filters");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDbData();
    const updatedFilters = await request.json();

    // Update the entire assessment-filters object
    db["assessment-filters"] = {
      ...db["assessment-filters"],
      ...updatedFilters,
    };

    await writeDbData(db);

    return createSuccessResponse(db["assessment-filters"]);
  } catch (error) {
    console.error("Error updating assessment filters:", error);
    return createErrorResponse("Failed to update assessment filters");
  }
}
