import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "./supabase";
import { currentUser } from "@clerk/nextjs/server";
import { getDefaultOrganizationId } from "./database-validator";

export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Get current user's organization ID from Clerk and database
export async function getCurrentUserContext() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user's organization from database
    let { data: userData, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        organization_id,
        organization_role,
        is_active,
        organizations:organization_id (
          id,
          name,
          address,
          email,
          created_at
        )
      `)
      .eq('id', user.id)
      .single();

    // If user doesn't exist in database, create a default record
    if (error && error.code === 'PGRST116') { // No rows returned
      
      
      // Get or create default organization
      const defaultOrgId = await getDefaultOrganizationId();
      
      // Create the user record
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          organization_id: defaultOrgId,
          organization_role: 'employee',
          is_active: true
        })
        .select(`
          id,
          organization_id,
          organization_role,
          is_active,
          organizations:organization_id (
            id,
            name,
            address,
            email,
            created_at
          )
        `)
        .single();
      
      if (createError) {
        throw new Error(`Failed to create user record: ${createError.message}`);
      }
      
      userData = newUser;
    } else if (error) {
      throw new Error(`Failed to get user data: ${error.message}`);
    }

    if (!userData) {
      throw new Error("Failed to get user data after creation");
    }

    return {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      organizationId: userData.organization_id,
      organizationRole: userData.organization_role,
      isActive: userData.is_active,
      organization: userData.organizations
    };
  } catch (error) {
    console.error("Error getting current user context:", error);
    throw error;
  }
}

// Get current user without auto-creating (for onboarding checks)
export async function getCurrentUserWithoutCreating() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user's organization from database
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        organization_id,
        organization_role,
        is_active,
        organizations:organization_id (
          id,
          name,
          address,
          email,
          created_at
        )
      `)
      .eq('id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist - return null instead of creating
      return {
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        organizationId: null,
        organizationRole: null,
        isActive: null,
        organization: null,
        exists: false
      };
    } else if (error) {
      throw new Error(`Failed to get user data: ${error.message}`);
    }

    return {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      organizationId: userData.organization_id,
      organizationRole: userData.organization_role,
      isActive: userData.is_active,
      organization: userData.organizations,
      exists: true
    };
  } catch (error) {
    console.error("Error getting current user context:", error);
    throw error;
  }
}

// Middleware to check organization membership
export async function checkOrganizationAccess(organizationId: string) { // Changed to string UUID to match schema
  try {
    const userContext = await getCurrentUserContext();
    
    if (userContext.organizationId !== organizationId) {
      throw new Error("Access denied: User does not belong to this organization");
    }
    
    if (!userContext.isActive) {
      throw new Error("Access denied: User account is inactive");
    }
    
    return userContext;
  } catch (error) {
    throw error;
  }
}

// Apply filters to Supabase query
export function applyFilters(query: any, searchParams: URLSearchParams, allowedFilters: string[]) {
  let filteredQuery = query;

  for (const [key, value] of searchParams.entries()) {
    // Skip pagination and sorting params
    if (["_limit", "_page", "_sort", "_order"].includes(key)) {
      continue;
    }

    // Only apply allowed filters
    if (allowedFilters.includes(key)) {
      // Handle different filter types
      if (key.endsWith("_id") || key === "id") {
        // Exact match for IDs
        filteredQuery = filteredQuery.eq(key, value);
      } else if (key === "status") {
        // Exact match for status
        filteredQuery = filteredQuery.eq(key, value);
      } else {
        // Text search for other fields
        filteredQuery = filteredQuery.ilike(key, `%${value}%`);
      }
    }
  }

  return filteredQuery;
}

// Apply sorting to Supabase query
export function applySorting(query: any, searchParams: URLSearchParams) {
  const sortBy = searchParams.get("_sort");
  const order = searchParams.get("_order") || "asc";

  if (sortBy) {
    query = query.order(sortBy, { ascending: order === "asc" });
  } else {
    // Default sort by created_at descending
    query = query.order("created_at", { ascending: false });
  }

  return query;
}

// Apply pagination to Supabase query
export function applyPagination(query: any, searchParams: URLSearchParams) {
  const limit = parseInt(searchParams.get("_limit") || "50");
  const page = parseInt(searchParams.get("_page") || "1");

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  return query.range(start, end);
}

// Process all query parameters (filter, sort, paginate)
export function processQueryParams(
  query: any,
  searchParams: URLSearchParams,
  allowedFilters: string[] = []
) {
  let processedQuery = applyFilters(query, searchParams, allowedFilters);
  processedQuery = applySorting(processedQuery, searchParams);
  processedQuery = applyPagination(processedQuery, searchParams);

  return processedQuery;
}

// Validate required fields
export function validateRequiredFields(data: any, requiredFields: string[]) {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ""
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
}

// Handle database errors
// Enhanced database error handler with better new instance support
export function handleDatabaseError(error: any) {
  console.error('Database error:', error);
  
  // Handle specific Supabase error codes
  switch (error?.code) {
    case 'PGRST116':
      return createErrorResponse('Resource not found', 404);
    case 'PGRST301':
      return createErrorResponse('Duplicate resource', 409);
    case '42P01':
      // Table does not exist - common in new Supabase instances
      return createErrorResponse(
        'Database schema not properly initialized. Please ensure all required tables are created.',
        503
      );
    case '42501':
      // Insufficient privilege
      return createErrorResponse(
        'Database permission error. Please check your Supabase service role key permissions.',
        403
      );
    case '23505':
      // Unique violation
      return createErrorResponse('Resource already exists', 409);
    case '23503':
      // Foreign key violation
      return createErrorResponse('Referenced resource does not exist', 400);
    case '23502':
      // Not null violation
      return createErrorResponse('Required field is missing', 400);
    case 'PGRST001':
      // Request timeout
      return createErrorResponse('Database request timeout', 408);
    case 'PGRST000':
      // Connection error
      return createErrorResponse(
        'Database connection error. Please check your Supabase configuration.',
        503
      );
    default:
      // Check for JWT/auth errors
      if (error?.message?.includes('JWT') || error?.message?.includes('invalid API key')) {
        return createErrorResponse(
          'Invalid Supabase credentials. Please check your API keys.',
          401
        );
      }
      
      if (error?.message?.includes('connection')) {
        return createErrorResponse(
          'Database connection failed. Please check your Supabase URL and network connectivity.',
          503
        );
      }
      
      return createErrorResponse(
        error?.message || 'Database operation failed',
        500
      );
  }
}

// Sanitize data for database insertion
export function sanitizeData(data: any) {
  const sanitized = { ...data };
  
  // Remove undefined values (Supabase doesn't handle them well)
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });
  
  return sanitized;
}

// Add timestamps for creation
export function addCreateTimestamps(data: any) {
  const now = new Date().toISOString();
  return {
    ...data,
    created_at: now,
    updated_at: now,
  };
}

// Add timestamp for updates
export function addUpdateTimestamp(data: any) {
  return {
    ...data,
    updated_at: new Date().toISOString(),
  };
}
