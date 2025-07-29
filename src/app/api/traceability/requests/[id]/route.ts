import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
} from "@/src/lib/supabase-utils";
import { transformFromDb } from "@/src/types/server-transforms";
import type { TraceabilityRequestDetail } from "@/src/types/traceability";
import { Product } from "@/src/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userContext = await getCurrentUserContext();
    const { id } = await params;

    // Fetch traceability request details from the database
    const { data: request, error } = await supabaseAdmin
      .from('trace_requests')
      .select(`
        *,
        requesting_organization:organizations!requesting_organization_id(
          id,
          name,
          email,
          address,
          created_at
        ),
        target_organization:organizations!target_organization_id(
          id,
          name,
          email,
          address,
          created_at
        ),
        assessment:assessments!assessment_id(
          id,
          title,
          description,
          status,
          priority,
          due_date,
          product_ids,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse("Traceability request not found", 404);
      }
      return handleDatabaseError(error);
    }

    // Check if user has access to this request
    const hasAccess = 
      request.requesting_organization_id === userContext.organizationId ||
      request.target_organization_id === userContext.organizationId;

    if (!hasAccess) {
      return createErrorResponse("Access denied", 403);
    }

    // Fetch products separately if product_ids exist
    let products = [];
    if (request.product_ids && request.product_ids.length > 0) {
      const { data: productData, error: productError } = await supabaseAdmin
        .from('products')
        .select('*')
        .in('id', request.product_ids);

      if (!productError && productData) {
        products = productData.map((p: any) => transformFromDb(p));
      }
    }

    // Fetch responses for this request
    const { data: responsesData, error: responsesError } = await supabaseAdmin
      .from('assessment_responses')
      .select(`
        *,
        responding_organization:organizations!responding_organization_id(
          id,
          name,
          email
        )
      `)
      .eq('trace_request_id', id);

    const responses = responsesError ? [] : responsesData.map((r: any) => transformFromDb(r));

    // Fetch cascaded requests (child requests)
    const { data: cascadedData, error: cascadedError } = await supabaseAdmin
      .from('trace_requests')
      .select(`
        *,
        requesting_organization:organizations!requesting_organization_id(id, name),
        target_organization:organizations!target_organization_id(id, name)
      `)
      .eq('parent_request_id', id);

    const cascadedRequests = cascadedError ? [] : cascadedData.map((r: any) => transformFromDb(r));

    // Transform the main request and build the response
    const transformedRequest: TraceabilityRequestDetail = {
      ...transformFromDb(request),
      requestingOrganization: transformFromDb(request.requesting_organization),
      targetOrganization: transformFromDb(request.target_organization),
      assessment: transformFromDb(request.assessment),
      products,
      responses,
      cascadedRequests
    };

    return createSuccessResponse(transformedRequest);
  } catch (error) {
    console.error("Error fetching traceability request:", error);
    return createErrorResponse("Failed to fetch traceability request");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userContext = await getCurrentUserContext();
    const { id } = params;
    const body = await request.json();

    // First check if the request exists and user has access
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from('trace_requests')
      .select('requesting_organization_id, target_organization_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse("Traceability request not found", 404);
      }
      return handleDatabaseError(fetchError);
    }

    // Check if user has access to update this request
    const hasAccess = 
      existingRequest.requesting_organization_id === userContext.organizationId ||
      existingRequest.target_organization_id === userContext.organizationId;

    if (!hasAccess) {
      return createErrorResponse("Access denied", 403);
    }

    // Update traceability request in the database
    const { data, error } = await supabaseAdmin
      .from('trace_requests')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(transformFromDb(data));
  } catch (error) {
    console.error("Error updating traceability request:", error);
    return createErrorResponse("Failed to update traceability request");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userContext = await getCurrentUserContext();
    const { id } = params;

    // First check if the request exists and user has access
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from('trace_requests')
      .select('requesting_organization_id, target_organization_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse("Traceability request not found", 404);
      }
      return handleDatabaseError(fetchError);
    }

    // Check if user has access to delete this request (only requesting org can delete)
    const hasAccess = existingRequest.requesting_organization_id === userContext.organizationId;

    if (!hasAccess) {
      return createErrorResponse("Access denied. Only the requesting organization can delete a request.", 403);
    }

    // Delete traceability request from the database
    const { error } = await supabaseAdmin
      .from('trace_requests')
      .delete()
      .eq('id', id);

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse({ message: 'Traceability request deleted successfully' });
  } catch (error) {
    console.error("Error deleting traceability request:", error);
    return createErrorResponse("Failed to delete traceability request");
  }
}
