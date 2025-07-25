import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  processQueryParams,
  validateRequiredFields,
  handleDatabaseError,
  sanitizeData,
  addCreateTimestamps,
} from "@/src/lib/supabase-utils";

export async function GET(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const searchParams = request.nextUrl.searchParams;

    // Get assessments for user's organization or requested assessments
    let query = supabaseAdmin
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
      `);

    // Filter to user's organization assessments or assessments they've been requested to complete
    query = query.or(`organization_id.eq.${userContext.organizationId},requesting_organization_id.eq.${userContext.organizationId}`);

    // Apply filters, sorting, and pagination
    const allowedFilters = ['status', 'priority', 'topic', 'template_id'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: assessments, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return createErrorResponse("Failed to fetch assessments");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const assessmentData = await request.json();

    // Validate required fields
    validateRequiredFields(assessmentData, ['template_id', 'title']);

    // Set organization ID from user context
    assessmentData.organization_id = userContext.organizationId;
    assessmentData.created_by = userContext.userId;

    // Set default values
    if (!assessmentData.status) {
      assessmentData.status = 'draft';
    }
    if (!assessmentData.priority) {
      assessmentData.priority = 'medium';
    }
    if (!assessmentData.data_completeness) {
      assessmentData.data_completeness = 0.0;
    }

    // Sanitize and add timestamps
    const assessmentToCreate = addCreateTimestamps(sanitizeData(assessmentData));

    const { data: assessment, error } = await supabaseAdmin
      .from('assessments')
      .insert(assessmentToCreate)
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
        )
      `)
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(assessment, 201);
  } catch (error) {
    console.error("Error creating assessment:", error);
    return createErrorResponse("Failed to create assessment");
  }
}
