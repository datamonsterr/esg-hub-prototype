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

    let templates = db["assessment-templates"] || [];
    templates = processQueryParams(templates, searchParams);

    return createSuccessResponse(templates);
  } catch (error) {
    console.error("Error fetching assessment templates:", error);
    return createErrorResponse("Failed to fetch assessment templates");
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDbData();
    const newTemplate = await request.json();

    // Generate ID if not provided
    if (!newTemplate.id) {
      newTemplate.id = generateId("at");
    }

    // Add timestamps
    const templateWithTimestamps = addTimestamps(newTemplate);

    if (!db["assessment-templates"]) {
      db["assessment-templates"] = [];
    }

    db["assessment-templates"].push(templateWithTimestamps);
    await writeDbData(db);

    return createSuccessResponse(templateWithTimestamps, 201);
  } catch (error) {
    console.error("Error creating assessment template:", error);
    return createErrorResponse("Failed to create assessment template");
  }
}
