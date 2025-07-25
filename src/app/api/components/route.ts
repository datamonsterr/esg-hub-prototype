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

    // Components are stored in the products table with type != 'final_product'
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .eq('organization_id', userContext.organizationId)
      .neq('type', 'final_product'); // Filter for components only

    // Apply additional filters
    const productId = searchParams.get("productId");
    const parentId = searchParams.get("parentId");
    const type = searchParams.get("type");

    if (parentId) {
      query = query.eq('parent_id', parseInt(parentId));
    }

    if (type) {
      query = query.eq('type', type);
    }

    // Apply filters, sorting, and pagination
    const allowedFilters = ['name', 'sku', 'category', 'type', 'status'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: components, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(components);
  } catch (error) {
    console.error("Error fetching components:", error);
    return createErrorResponse("Failed to fetch components");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const newComponent = await request.json();

    // Validate required fields
    validateRequiredFields(newComponent, ['name']);

    // Set organization_id from user context
    newComponent.organization_id = userContext.organizationId;

    // Set component-specific defaults
    if (!newComponent.type) {
      newComponent.type = 'component';
    }
    if (!newComponent.quantity) {
      newComponent.quantity = 1.0;
    }
    if (!newComponent.unit) {
      newComponent.unit = 'pcs';
    }
    if (!newComponent.status) {
      newComponent.status = 'active';
    }
    if (!newComponent.data_completeness) {
      newComponent.data_completeness = 0.0;
    }
    if (!newComponent.metadata) {
      newComponent.metadata = {};
    }

    // Ensure it's not a final product
    if (newComponent.type === 'final_product') {
      newComponent.type = 'component';
    }

    // Sanitize and add timestamps
    const componentData = addCreateTimestamps(sanitizeData(newComponent));

    const { data: component, error } = await supabaseAdmin
      .from('products')
      .insert(componentData)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(component, 201);
  } catch (error) {
    console.error("Error creating component:", error);
    return createErrorResponse("Failed to create component");
  }
}
