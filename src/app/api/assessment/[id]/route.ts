import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  checkOrganizationAccess,
  validateRequiredFields,
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

    const { data: assessment, error } = await supabaseAdmin
      .from('assessments')
      .select(`
        id,
        template_id,
        organization_id,
        requesting_organization_id,
        title,
        description,
        topic,
        status,
        priority,
        product_ids,
        created_by,
        due_date,
        completed_at,
        data_completeness,
        created_at,
        updated_at,
        assessment_templates:template_id (
          id,
          title,
          description,
          icon,
          tags,
          schema
        ),
        organizations:organization_id (
          id,
          name,
          address,
          email
        ),
        requesting_organizations:requesting_organization_id (
          id,
          name
        )
      `)
      .eq('id', parseInt(id))
      .single();

    if (error && error.code === 'PGRST116') {
      return createErrorResponse("Assessment not found", 404);
    }

    if (error) {
      return handleDatabaseError(error);
    }

    // Check if user has access to this assessment
    if (assessment.organization_id !== userContext.organizationId && 
        assessment.requesting_organization_id !== userContext.organizationId) {
      return createErrorResponse("Access denied", 403);
    }

    return createSuccessResponse(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return createErrorResponse("Failed to fetch assessment");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userContext = await getCurrentUserContext();
    const updatedData = await request.json();

    // First, get the assessment to check ownership
    const { data: existingAssessment, error: fetchError } = await supabaseAdmin
      .from('assessments')
      .select('id, organization_id, requesting_organization_id')
      .eq('id', parseInt(id))
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return createErrorResponse("Assessment not found", 404);
    }

    if (fetchError) {
      return handleDatabaseError(fetchError);
    }

    // Check if user has access to update this assessment
    if (existingAssessment.organization_id !== userContext.organizationId && 
        existingAssessment.requesting_organization_id !== userContext.organizationId) {
      return createErrorResponse("Access denied", 403);
    }

    // Remove fields that shouldn't be updated directly
    const { id: _, created_at, created_by, organization_id, ...updateData } = updatedData;

    // Sanitize and add update timestamp
    const assessmentToUpdate = addUpdateTimestamp(sanitizeData(updateData));

    const { data: assessment, error } = await supabaseAdmin
      .from('assessments')
      .update(assessmentToUpdate)
      .eq('id', parseInt(id))
      .select(`
        id,
        template_id,
        organization_id,
        requesting_organization_id,
        title,
        description,
        topic,
        status,
        priority,
        product_ids,
        created_by,
        due_date,
        completed_at,
        data_completeness,
        created_at,
        updated_at,
        assessment_templates:template_id (
          id,
          title,
          description,
          icon,
          tags
        ),
        organizations:organization_id (
          id,
          name
        ),
        requesting_organizations:requesting_organization_id (
          id,
          name
        )
      `)
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(assessment);
  } catch (error) {
    console.error("Error updating assessment:", error);
    return createErrorResponse("Failed to update assessment");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userContext = await getCurrentUserContext();

    // First, get the assessment to check ownership
    const { data: existingAssessment, error: fetchError } = await supabaseAdmin
      .from('assessments')
      .select('id, organization_id, created_by')
      .eq('id', parseInt(id))
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return createErrorResponse("Assessment not found", 404);
    }

    if (fetchError) {
      return handleDatabaseError(fetchError);
    }

    // Check if user has access to delete this assessment
    // Only assessment creator or org admin can delete
    if (existingAssessment.organization_id !== userContext.organizationId || 
        (existingAssessment.created_by !== userContext.userId && userContext.organizationRole !== 'admin')) {
      return createErrorResponse("Access denied", 403);
    }

    const { error } = await supabaseAdmin
      .from('assessments')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse({
      message: "Assessment deleted successfully",
      id: parseInt(id),
    });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return createErrorResponse("Failed to delete assessment");
  }
}
