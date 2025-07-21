import { NextRequest, NextResponse } from "next/server";
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

    // In db.json, supplier assessments are stored as 'assessments'
    const assessment = db.assessments?.find(
      (assessment: any) => assessment.id === id
    );

    if (!assessment) {
      return createErrorResponse("Supplier assessment not found", 404);
    }

    return createSuccessResponse(assessment);
  } catch (error) {
    console.error("Error fetching supplier assessment:", error);
    return createErrorResponse("Failed to fetch supplier assessment");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();
    const updatedData = await request.json();

    const assessmentIndex = db.assessments?.findIndex(
      (assessment: any) => assessment.id === id
    );

    if (assessmentIndex === -1 || assessmentIndex === undefined) {
      return createErrorResponse("Supplier assessment not found", 404);
    }

    // Update the assessment while preserving original data
    db.assessments[assessmentIndex] = addTimestamps({
      ...db.assessments[assessmentIndex],
      ...updatedData,
      id, // Ensure ID doesn't change
    });

    await writeDbData(db);

    return createSuccessResponse(db.assessments[assessmentIndex]);
  } catch (error) {
    console.error("Error updating supplier assessment:", error);
    return createErrorResponse("Failed to update supplier assessment");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();

    const assessmentIndex = db.assessments?.findIndex(
      (assessment: any) => assessment.id === id
    );

    if (assessmentIndex === -1 || assessmentIndex === undefined) {
      return createErrorResponse("Supplier assessment not found", 404);
    }

    const deletedAssessment = db.assessments.splice(assessmentIndex, 1)[0];
    await writeDbData(db);

    return createSuccessResponse({
      message: "Supplier assessment deleted successfully",
      assessment: deletedAssessment,
    });
  } catch (error) {
    console.error("Error deleting supplier assessment:", error);
    return createErrorResponse("Failed to delete supplier assessment");
  }
}
