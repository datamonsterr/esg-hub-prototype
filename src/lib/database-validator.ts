/**
 * Database Connection Validator
 * Validates database schema and connectivity for new Supabase instances
 */

import { supabaseAdmin } from './supabase';

export interface DatabaseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  tableStatus: Record<string, boolean>;
}

const REQUIRED_TABLES = [
  'organizations',
  'users', 
  'products',
  'assessments',
  'assessment_templates',
  'assessment_responses',
  'notifications',
  'file_uploads',
  'trace_requests',
  'integration_activities',
  'organization_invites'
];

/**
 * Validates database connection and schema
 */
export async function validateDatabaseConnection(): Promise<DatabaseValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const tableStatus: Record<string, boolean> = {};

  try {
    // Test basic connection
    const { error: connectionError } = await supabaseAdmin
      .from('pg_tables')
      .select('count')
      .limit(1);

    if (connectionError) {
      errors.push(`Database connection failed: ${connectionError.message}`);
      return {
        isValid: false,
        errors,
        warnings,
        tableStatus
      };
    }

    // Check each required table
    for (const tableName of REQUIRED_TABLES) {
      try {
        const { error } = await supabaseAdmin
          .from(tableName)
          .select('count')
          .limit(1);

        if (error) {
          if (error.code === '42P01') {
            errors.push(`Table '${tableName}' does not exist`);
            tableStatus[tableName] = false;
          } else {
            warnings.push(`Table '${tableName}' exists but has access issues: ${error.message}`);
            tableStatus[tableName] = true; // Table exists but has permission issues
          }
        } else {
          tableStatus[tableName] = true;
        }
      } catch (err) {
        errors.push(`Failed to check table '${tableName}': ${err}`);
        tableStatus[tableName] = false;
      }
    }

    // Check for default organization
    if (tableStatus['organizations']) {
      try {
        const { data: orgs, error } = await supabaseAdmin
          .from('organizations')
          .select('id, name')
          .limit(1);

        if (error) {
          warnings.push(`Could not query organizations table: ${error.message}`);
        } else if (!orgs || orgs.length === 0) {
          warnings.push('No organizations found in database - you may need to create a default organization');
        }
      } catch (err) {
        warnings.push(`Error checking organizations: ${err}`);
      }
    }

  } catch (err) {
    errors.push(`Database validation failed: ${err}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    tableStatus
  };
}

/**
 * Creates default organization if none exists
 */
export async function ensureDefaultOrganization(): Promise<{ id: number | null, error?: string }> {
  try {
    // Check if any organization exists
    const { data: existingOrgs, error: checkError } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .limit(1);

    if (checkError) {
      return { id: null, error: `Failed to check organizations: ${checkError.message}` };
    }

    if (existingOrgs && existingOrgs.length > 0) {
      return { id: existingOrgs[0].id };
    }

    // Create default organization
    const { data: newOrg, error: createError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: 'Default Organization',
        email: 'admin@example.com',
        address: 'Default Address'
      })
      .select('id')
      .single();

    if (createError) {
      return { id: null, error: `Failed to create default organization: ${createError.message}` };
    }

    return { id: newOrg.id };
  } catch (err) {
    return { id: null, error: `Error ensuring default organization: ${err}` };
  }
}

/**
 * Get first available organization ID with fallback creation
 */
export async function getDefaultOrganizationId(): Promise<number> {
  const result = await ensureDefaultOrganization();
  
  if (result.error || result.id === null) {
    console.error('Could not get/create default organization:', result.error);
    // Return 1 as ultimate fallback - this should be replaced with proper error handling
    return 1;
  }
  
  return result.id;
}
