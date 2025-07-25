import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
} from "@/src/lib/supabase-utils";

export async function GET(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();

    // Get assessment filter preferences from organization metadata
    const { data: organization, error } = await supabaseAdmin
      .from('organizations')
      .select('metadata')
      .eq('id', userContext.organizationId)
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    const filters = organization?.metadata?.assessmentFilters || {};

    return createSuccessResponse(filters);
  } catch (error) {
    console.error("Error fetching assessment filters:", error);
    return createErrorResponse("Failed to fetch assessment filters");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const updatedFilters = await request.json();

    // Only allow admins to update organization filter preferences
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    // Get current organization metadata
    const { data: organization, error: fetchError } = await supabaseAdmin
      .from('organizations')
      .select('metadata')
      .eq('id', userContext.organizationId)
      .single();

    if (fetchError) {
      return handleDatabaseError(fetchError);
    }

    const currentMetadata = organization?.metadata || {};
    
    // Update the assessment filters in metadata
    const updatedMetadata = {
      ...currentMetadata,
      assessmentFilters: {
        ...currentMetadata.assessmentFilters,
        ...updatedFilters,
      },
    };

    const { data: updatedOrg, error } = await supabaseAdmin
      .from('organizations')
      .update({ 
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', userContext.organizationId)
      .select('metadata')
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(updatedOrg.metadata.assessmentFilters);
  } catch (error) {
    console.error("Error updating assessment filters:", error);
    return createErrorResponse("Failed to update assessment filters");
  }
}
