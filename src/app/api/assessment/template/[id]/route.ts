import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
  sanitizeData,
  addUpdateTimestamp,
} from "@/src/lib/supabase-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userContext = await getCurrentUserContext();

    // Handle special "blank" template case
    if (id === "blank") {
      const blankTemplate = {
        id: "blank",
        title: "",
        description: "",
        icon: null,
        recommended: false,
        tags: [],
        schema: { sections: [] },
        created_by_organization_id: userContext.organizationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return createSuccessResponse(blankTemplate);
    }

    const { data: template, error } = await supabaseAdmin
      .from('assessment_templates')
      .select(`
        id,
        created_by_organization_id,
        title,
        description,
        icon,
        recommended,
        last_used,
        tags,
        schema,
        created_at,
        updated_at,
        organizations:created_by_organization_id (
          id,
          name
        )
      `)
      .eq('id', parseInt(id))
      .single();

    if (error && error.code === 'PGRST116') {
      return createErrorResponse("Assessment template not found", 404);
    }

    if (error) {
      return handleDatabaseError(error);
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
    const userContext = await getCurrentUserContext();
    const updatedData = await request.json();

    // First, get the template to check ownership
    const { data: existingTemplate, error: fetchError } = await supabaseAdmin
      .from('assessment_templates')
      .select('id, created_by_organization_id')
      .eq('id', parseInt(id))
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return createErrorResponse("Assessment template not found", 404);
    }

    if (fetchError) {
      return handleDatabaseError(fetchError);
    }

    // Check if user has access to update this template
    if (existingTemplate.created_by_organization_id !== userContext.organizationId) {
      return createErrorResponse("Access denied: You can only edit templates created by your organization", 403);
    }

    // Remove fields that shouldn't be updated directly
    const { id: _, created_at, created_by_organization_id, ...updateData } = updatedData;

    // Sanitize and add update timestamp
    const templateToUpdate = addUpdateTimestamp(sanitizeData(updateData));

    const { data: template, error } = await supabaseAdmin
      .from('assessment_templates')
      .update(templateToUpdate)
      .eq('id', parseInt(id))
      .select(`
        id,
        created_by_organization_id,
        title,
        description,
        icon,
        recommended,
        last_used,
        tags,
        schema,
        created_at,
        updated_at,
        organizations:created_by_organization_id (
          id,
          name
        )
      `)
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(template);
  } catch (error) {
    console.error("Error updating assessment template:", error);
    return createErrorResponse("Failed to update assessment template");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userContext = await getCurrentUserContext();

    // First, get the template to check ownership
    const { data: existingTemplate, error: fetchError } = await supabaseAdmin
      .from('assessment_templates')
      .select('id, created_by_organization_id')
      .eq('id', parseInt(id))
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return createErrorResponse("Assessment template not found", 404);
    }

    if (fetchError) {
      return handleDatabaseError(fetchError);
    }

    // Check if user has access to delete this template
    if (existingTemplate.created_by_organization_id !== userContext.organizationId) {
      return createErrorResponse("Access denied: You can only delete templates created by your organization", 403);
    }

    const { error } = await supabaseAdmin
      .from('assessment_templates')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse({
      message: "Assessment template deleted successfully",
      id: parseInt(id),
    });
  } catch (error) {
    console.error("Error deleting assessment template:", error);
    return createErrorResponse("Failed to delete assessment template");
  }
}
