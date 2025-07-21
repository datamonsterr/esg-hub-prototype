import { NextRequest, NextResponse } from "next/server";
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

    // In db.json, supplier assessments are stored as 'assessments'
    let assessments = db.assessments || [];
    assessments = processQueryParams(assessments, searchParams);

    return createSuccessResponse(assessments);
  } catch (error) {
    console.error("Error fetching supplier assessments:", error);
    return createErrorResponse("Failed to fetch supplier assessments");
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDbData();
    const newAssessment = await request.json();

    // Generate ID if not provided
    if (!newAssessment.id) {
      newAssessment.id = generateId("assessment");
    }

    // Add timestamps
    const assessmentWithTimestamps = addTimestamps(newAssessment);

    if (!db.assessments) {
      db.assessments = [];
    }

    db.assessments.push(assessmentWithTimestamps);
    await writeDbData(db);

    return createSuccessResponse(assessmentWithTimestamps, 201);
  } catch (error) {
    console.error("Error creating supplier assessment:", error);
    return createErrorResponse("Failed to create supplier assessment");
  }
}
