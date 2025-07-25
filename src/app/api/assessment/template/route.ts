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

    // Get assessment templates - show all public templates and organization's private ones
    let query = supabaseAdmin
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
      `);

    // Apply filters, sorting, and pagination
    const allowedFilters = ['recommended', 'tags'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: templates, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(templates || []);
  } catch (error) {
    console.error("Error fetching assessment templates:", error);
    return createErrorResponse("Failed to fetch assessment templates");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const templateData = await request.json();

    // Validate required fields
    validateRequiredFields(templateData, ['title', 'schema']);

    // Set organization ID from user context
    templateData.created_by_organization_id = userContext.organizationId;

    // Set default values
    if (templateData.recommended === undefined) {
      templateData.recommended = false;
    }
    if (!templateData.tags) {
      templateData.tags = [];
    }

    // Sanitize and add timestamps
    const templateToCreate = addCreateTimestamps(sanitizeData(templateData));

    const { data: template, error } = await supabaseAdmin
      .from('assessment_templates')
      .insert(templateToCreate)
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

    return createSuccessResponse(template, 201);
  } catch (error) {
    console.error("Error creating assessment template:", error);
    return createErrorResponse("Failed to create assessment template");
  }
}
