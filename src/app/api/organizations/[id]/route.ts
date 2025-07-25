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
    const organizationId = parseInt(id);

    if (isNaN(organizationId)) {
      return createErrorResponse("Invalid organization ID", 400);
    }

    // Check if user has access to this organization
    await checkOrganizationAccess(organizationId);

    const { data: organization, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse("Organization not found", 404);
      }
      return handleDatabaseError(error);
    }

    return createSuccessResponse(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return createErrorResponse("Failed to fetch organization");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const organizationId = parseInt(id);

    if (isNaN(organizationId)) {
      return createErrorResponse("Invalid organization ID", 400);
    }

    // Check if user has access to this organization
    const userContext = await checkOrganizationAccess(organizationId);

    // Only allow admins to update organization details
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    const updatedData = await request.json();

    // Sanitize and add update timestamp
    const organizationData = addUpdateTimestamp(sanitizeData(updatedData));

    const { data: organization, error } = await supabaseAdmin
      .from('organizations')
      .update(organizationData)
      .eq('id', organizationId)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(organization);
  } catch (error) {
    console.error("Error updating organization:", error);
    return createErrorResponse("Failed to update organization");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const organizationId = parseInt(id);

    if (isNaN(organizationId)) {
      return createErrorResponse("Invalid organization ID", 400);
    }

    // Check if user has access to this organization
    const userContext = await checkOrganizationAccess(organizationId);

    // Only allow admins to delete organization
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    const { error } = await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', organizationId);

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return createErrorResponse("Failed to delete organization");
  }
}
