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

    return createSuccessResponse(product);
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

    // Don't allow changing organization_id
    delete updatedData.organization_id;
    delete updatedData.id;

    // Sanitize and add update timestamp
    const productData = addUpdateTimestamp(sanitizeData(updatedData));

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

    return createSuccessResponse(product);
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
