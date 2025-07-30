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
import { Product } from "@/src/types/product";
import { DbProduct, transformProductFromDb, transformProductToDb } from "@/src/types/server-transforms";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Validate UUID format (basic check)
    if (!id || typeof id !== 'string' || id.length < 32) {
      return createErrorResponse("Invalid product ID format", 400);
    }

    const userContext = await getCurrentUserContext();
    

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('organization_id', userContext.organizationId)
      .single();

    if (error) {
      
      if (error.code === 'PGRST116') {
        // Also try to find the product without organization filter for debugging
        const { data: productAnyOrg } = await supabaseAdmin
          .from('products')
          .select('id, name, organization_id')
          .eq('id', id)
          .single();
        
        if (productAnyOrg) {
          
          return createErrorResponse("Product not found in your organization", 404);
        }
        
        return createErrorResponse("Product not found", 404);
      }
      return handleDatabaseError(error);
    }

    const transformedProduct = transformProductFromDb(product as DbProduct);

    return createSuccessResponse(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return createErrorResponse("Failed to fetch product");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Validate UUID format (basic check)
    if (!id || typeof id !== 'string' || id.length < 32) {
      return createErrorResponse("Invalid product ID format", 400);
    }

    const userContext = await getCurrentUserContext();
    const updatedData = await request.json();

    // Don't allow changing organizationId or id (camelCase)
    delete updatedData.organizationId;
    delete updatedData.id;

    const dbUpdatedData = transformProductToDb(updatedData as Product);

    // Sanitize and add update timestamp
    const productData = addUpdateTimestamp(sanitizeData(dbUpdatedData));

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(productData)
      .eq('id', id)
      .eq('organization_id', userContext.organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse("Product not found", 404);
      }
      return handleDatabaseError(error);
    }

    const transformedProduct = transformProductFromDb(product as DbProduct);

    return createSuccessResponse(transformedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return createErrorResponse("Failed to update product");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Validate UUID format (basic check)
    if (!id || typeof id !== 'string' || id.length < 32) {
      return createErrorResponse("Invalid product ID format", 400);
    }

    const userContext = await getCurrentUserContext();

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
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
