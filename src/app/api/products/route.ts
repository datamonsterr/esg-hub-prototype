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

// Transform database fields to TypeScript camelCase
function transformProductFromDb(dbProduct: any) {
  return {
    id: dbProduct.id,
    organizationId: dbProduct.organization_id,
    parentId: dbProduct.parent_id,
    name: dbProduct.name,
    sku: dbProduct.sku,
    description: dbProduct.description,
    category: dbProduct.category,
    type: dbProduct.type,
    quantity: dbProduct.quantity,
    unit: dbProduct.unit,
    supplierOrganizationId: dbProduct.supplier_organization_id,
    metadata: dbProduct.metadata,
    dataCompleteness: dbProduct.data_completeness,
    missingDataFields: dbProduct.missing_data_fields,
    status: dbProduct.status,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
}

// Transform TypeScript camelCase to database fields
function transformProductToDb(product: any) {
  const dbProduct: any = {};
  
  if (product.id !== undefined) dbProduct.id = product.id;
  if (product.organizationId !== undefined) dbProduct.organization_id = product.organizationId;
  if (product.parentId !== undefined) dbProduct.parent_id = product.parentId;
  if (product.name !== undefined) dbProduct.name = product.name;
  if (product.sku !== undefined) dbProduct.sku = product.sku;
  if (product.description !== undefined) dbProduct.description = product.description;
  if (product.category !== undefined) dbProduct.category = product.category;
  if (product.type !== undefined) dbProduct.type = product.type;
  if (product.quantity !== undefined) dbProduct.quantity = product.quantity;
  if (product.unit !== undefined) dbProduct.unit = product.unit;
  if (product.supplierOrganizationId !== undefined) dbProduct.supplier_organization_id = product.supplierOrganizationId;
  if (product.metadata !== undefined) dbProduct.metadata = product.metadata;
  if (product.dataCompleteness !== undefined) dbProduct.data_completeness = product.dataCompleteness;
  if (product.missingDataFields !== undefined) dbProduct.missing_data_fields = product.missingDataFields;
  if (product.status !== undefined) dbProduct.status = product.status;
  if (product.createdAt !== undefined) dbProduct.created_at = product.createdAt;
  if (product.updatedAt !== undefined) dbProduct.updated_at = product.updatedAt;
  
  return dbProduct;
}

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

    // Transform products to camelCase format
    const transformedProducts = products?.map(transformProductFromDb) || [];

    return createSuccessResponse(transformedProducts);
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

    // Set organizationId from user context (camelCase)
    newProduct.organizationId = userContext.organizationId;

    // Set default values (camelCase)
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
    if (!newProduct.dataCompleteness) {
      newProduct.dataCompleteness = 0.0;
    }
    if (!newProduct.metadata) {
      newProduct.metadata = {};
    }

    // Transform to database format (snake_case)
    const dbProduct = transformProductToDb(newProduct);
    
    // Sanitize and add timestamps
    const productData = addCreateTimestamps(sanitizeData(dbProduct));

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    // Transform response back to camelCase
    const transformedProduct = transformProductFromDb(product);

    return createSuccessResponse(transformedProduct, 201);
  } catch (error) {
    console.error("Error creating product:", error);
    return createErrorResponse("Failed to create product");
  }
}
