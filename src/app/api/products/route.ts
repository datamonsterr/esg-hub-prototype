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

    // Start with base query - users can only see their organization's products
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .eq('organization_id', userContext.organizationId);

    // Apply filters, sorting, and pagination
    const allowedFilters = ['name', 'sku', 'category', 'type', 'status'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: products, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return createErrorResponse("Failed to fetch products");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const newProduct = await request.json();

    // Validate required fields
    validateRequiredFields(newProduct, ['name']);

    // Set organization_id from user context
    newProduct.organization_id = userContext.organizationId;

    // Set default values
    if (!newProduct.type) {
      newProduct.type = 'final_product';
    }
    if (!newProduct.quantity) {
      newProduct.quantity = 1.0;
    }
    if (!newProduct.unit) {
      newProduct.unit = 'pcs';
    }
    if (!newProduct.status) {
      newProduct.status = 'active';
    }
    if (!newProduct.data_completeness) {
      newProduct.data_completeness = 0.0;
    }
    if (!newProduct.metadata) {
      newProduct.metadata = {};
    }

    // Sanitize and add timestamps
    const productData = addCreateTimestamps(sanitizeData(newProduct));

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(product, 201);
  } catch (error) {
    console.error("Error creating product:", error);
    return createErrorResponse("Failed to create product");
  }
}
