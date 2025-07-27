import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  validateRequiredFields,
  handleDatabaseError,
  sanitizeData,
  addUpdateTimestamp,
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

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return createErrorResponse("Invalid product ID", 400);
    }

    const userContext = await getCurrentUserContext();

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('organization_id', userContext.organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse("Product not found", 404);
      }
      return handleDatabaseError(error);
    }

    // Transform product to camelCase format
    const transformedProduct = transformProductFromDb(product);

    return createSuccessResponse(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return createErrorResponse("Failed to fetch product");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return createErrorResponse("Invalid product ID", 400);
    }

    const userContext = await getCurrentUserContext();
    const updatedData = await request.json();

    // Don't allow changing organizationId or id (camelCase)
    delete updatedData.organizationId;
    delete updatedData.id;

    // Transform to database format (snake_case)
    const dbUpdatedData = transformProductToDb(updatedData);

    // Sanitize and add update timestamp
    const productData = addUpdateTimestamp(sanitizeData(dbUpdatedData));

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(productData)
      .eq('id', productId)
      .eq('organization_id', userContext.organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse("Product not found", 404);
      }
      return handleDatabaseError(error);
    }

    // Transform response back to camelCase
    const transformedProduct = transformProductFromDb(product);

    return createSuccessResponse(transformedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return createErrorResponse("Failed to update product");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return createErrorResponse("Invalid product ID", 400);
    }

    const userContext = await getCurrentUserContext();

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('organization_id', userContext.organizationId);

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return createErrorResponse("Failed to delete product");
  }
}
