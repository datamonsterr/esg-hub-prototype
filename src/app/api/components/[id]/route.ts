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
    const componentId = parseInt(id);

    if (isNaN(componentId)) {
      return createErrorResponse("Invalid component ID", 400);
    }

    const userContext = await getCurrentUserContext();

    // Components are stored in products table with type != 'final_product'
    const { data: component, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', componentId)
      .eq('organization_id', userContext.organizationId)
      .neq('type', 'final_product')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse("Component not found", 404);
      }
      return handleDatabaseError(error);
    }

    return createSuccessResponse(component);
  } catch (error) {
    console.error("Error fetching component:", error);
    return createErrorResponse("Failed to fetch component");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const componentId = parseInt(id);

    if (isNaN(componentId)) {
      return createErrorResponse("Invalid component ID", 400);
    }

    const userContext = await getCurrentUserContext();
    const updatedData = await request.json();

    // Don't allow changing organization_id or making it a final product
    delete updatedData.organization_id;
    delete updatedData.id;
    if (updatedData.type === 'final_product') {
      updatedData.type = 'component';
    }

    // Sanitize and add update timestamp
    const componentData = addUpdateTimestamp(sanitizeData(updatedData));

    const { data: component, error } = await supabaseAdmin
      .from('products')
      .update(componentData)
      .eq('id', componentId)
      .eq('organization_id', userContext.organizationId)
      .neq('type', 'final_product')
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse("Component not found", 404);
      }
      return handleDatabaseError(error);
    }

    return createSuccessResponse(component);
  } catch (error) {
    console.error("Error updating component:", error);
    return createErrorResponse("Failed to update component");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const componentId = parseInt(id);

    if (isNaN(componentId)) {
      return createErrorResponse("Invalid component ID", 400);
    }

    const userContext = await getCurrentUserContext();

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', componentId)
      .eq('organization_id', userContext.organizationId)
      .neq('type', 'final_product');

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse({ message: "Component deleted successfully" });
  } catch (error) {
    console.error("Error deleting component:", error);
    return createErrorResponse("Failed to delete component");
  }
}
