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

    // Handle special "blank" template case
    if (id === "blank") {
      const blankTemplate = {
        id: "blank",
        title: "",
        description: "",
        category: "",
        targetDataTypes: [],
        createdByOrganizationId: null,
        isPublic: true,
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return createSuccessResponse(blankTemplate);
    }

    const db = await getDbData();

    const template = db["assessment-templates"]?.find(
      (template: any) => template.id === id
    );

    if (!template) {
      return createErrorResponse("Assessment template not found", 404);
    }

    return createSuccessResponse(template);
  } catch (error) {
    console.error("Error fetching assessment template:", error);
    return createErrorResponse("Failed to fetch assessment template");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();
    const updatedData = await request.json();

    const templateIndex = db["assessment-templates"]?.findIndex(
      (template: any) => template.id === id
    );

    if (templateIndex === -1 || templateIndex === undefined) {
      return createErrorResponse("Assessment template not found", 404);
    }

    // Update the template while preserving original data
    db["assessment-templates"][templateIndex] = addTimestamps({
      ...db["assessment-templates"][templateIndex],
      ...updatedData,
      id, // Ensure ID doesn't change
    });

    await writeDbData(db);

    return createSuccessResponse(db["assessment-templates"][templateIndex]);
  } catch (error) {
    console.error("Error updating assessment template:", error);
    return createErrorResponse("Failed to update assessment template");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();

    const templateIndex = db["assessment-templates"]?.findIndex(
      (template: any) => template.id === id
    );

    if (templateIndex === -1 || templateIndex === undefined) {
      return createErrorResponse("Assessment template not found", 404);
    }

    const deletedTemplate = db["assessment-templates"].splice(
      templateIndex,
      1
    )[0];
    await writeDbData(db);

    return createSuccessResponse({
      message: "Assessment template deleted successfully",
      template: deletedTemplate,
    });
  } catch (error) {
    console.error("Error deleting assessment template:", error);
    return createErrorResponse("Failed to delete assessment template");
  }
}
