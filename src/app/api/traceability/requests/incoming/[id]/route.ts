import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase';
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
} from '@/src/lib/supabase-utils';
import { transformFromDb } from '@/src/types/server-transforms';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const userContext = await getCurrentUserContext();
    const { id } = params;

    // Fetch traceability request details from the database using proper snake_case field names
    const { data, error } = await supabaseAdmin
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
      .eq('target_organization_id', userContext.organizationId) // Only allow access to incoming requests
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse("Incoming traceability request not found", 404);
      }
      return handleDatabaseError(error);
    }

    // Fetch products if product_ids exist
    let products = [];
    if (data.product_ids && data.product_ids.length > 0) {
      const { data: productData, error: productError } = await supabaseAdmin
        .from('products')
        .select('*')
        .in('id', data.product_ids);

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

    // Transform and build the response
    const transformedData = {
      ...(transformFromDb(data) as any),
      requestingOrganization: transformFromDb(data.requesting_organization),
      targetOrganization: transformFromDb(data.target_organization),
      assessment: transformFromDb(data.assessment),
      products,
      responses
    };

    return createSuccessResponse(transformedData);
  } catch (error) {
    console.error("Error fetching incoming traceability request:", error);
    return createErrorResponse("Failed to fetch incoming traceability request");
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userContext = await getCurrentUserContext();
    const { id } = params;
    const body = await req.json();

    // First check if the request exists and is an incoming request
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from('trace_requests')
      .select('target_organization_id')
      .eq('id', id)
      .eq('target_organization_id', userContext.organizationId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse("Incoming traceability request not found", 404);
      }
      return handleDatabaseError(fetchError);
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
    console.error("Error updating incoming traceability request:", error);
    return createErrorResponse("Failed to update incoming traceability request");
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userContext = await getCurrentUserContext();
    const { id } = params;

    // First check if the request exists and is an incoming request
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from('trace_requests')
      .select('target_organization_id')
      .eq('id', id)
      .eq('target_organization_id', userContext.organizationId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse("Incoming traceability request not found", 404);
      }
      return handleDatabaseError(fetchError);
    }

    // Target organizations typically cannot delete incoming requests
    return createErrorResponse("Target organizations cannot delete incoming requests", 403);
  } catch (error) {
    console.error("Error deleting incoming traceability request:", error);
    return createErrorResponse("Failed to delete incoming traceability request");
  }
}