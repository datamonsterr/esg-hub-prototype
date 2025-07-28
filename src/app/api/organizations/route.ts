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
import type { Organization } from "@/src/types/common";
import { DbOrganization, transformOrganizationFromDb, transformOrganizationToDb } from "@/src/types/server-transforms";

export async function GET(request: NextRequest) {
  try {
    // Get current user context for access control
    const userContext = await getCurrentUserContext();
    
    const searchParams = request.nextUrl.searchParams;
    
    // Start with base query
    let query = supabaseAdmin
      .from('organizations')
      .select('*');

    // For non-admin users, they can only see their own organization
    // For now, let's allow all organizations to be fetched
    // You might want to add role-based filtering here

    // Apply filters, sorting, and pagination
    const allowedFilters = ['name', 'email', 'address'];
    query = processQueryParams(query, searchParams, allowedFilters);

    const { data: organizations, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    // Transform organizations to camelCase format
    const transformedOrganizations = organizations?.map((org: any) => 
      transformOrganizationFromDb(org as DbOrganization)
    ) || [];

    return createSuccessResponse(transformedOrganizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return createErrorResponse("Failed to fetch organizations");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();
    const newOrganization = await request.json();

    // Validate required fields
    validateRequiredFields(newOrganization, ['name']);

    // Transform to database format (snake_case)
    const dbOrganization = transformOrganizationToDb(newOrganization as Organization);

    // Sanitize and add timestamps
    const organizationData = addCreateTimestamps(sanitizeData(dbOrganization));

    const { data: organization, error } = await supabaseAdmin
      .from('organizations')
      .insert(organizationData)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    // Transform response back to camelCase
    const transformedOrganization = transformOrganizationFromDb(organization as DbOrganization);

    return createSuccessResponse(transformedOrganization, 201);
  } catch (error) {
    console.error("Error creating organization:", error);
    return createErrorResponse("Failed to create organization");
  }
}
