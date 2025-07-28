import { supabaseAdmin } from "./supabase";
import { createErrorResponse } from "./supabase-utils";

export interface CreateUserData {
  clerkId: string;
  organizationId: string; // Changed to string UUID to match schema
  organizationRole?: "admin" | "employee";
  isActive?: boolean;
}

export interface UpdateUserData {
  organizationId?: string; // Changed to string UUID to match schema
  organizationRole?: "admin" | "employee";
  isActive?: boolean;
}

/**
 * Create a new user record in Supabase users table
 * Called when a new user signs up or is invited
 */
export async function createUser(userData: CreateUserData) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        id: userData.clerkId,
        organization_id: userData.organizationId,
        organization_role: userData.organizationRole || 'employee',
        is_active: userData.isActive !== false, // Default to true
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

/**
 * Update an existing user record in Supabase users table
 */
export async function updateUser(clerkId: string, userData: UpdateUserData) {
  try {
    const updateData: any = {};
    
    if (userData.organizationId !== undefined) {
      updateData.organization_id = userData.organizationId;
    }
    if (userData.organizationRole !== undefined) {
      updateData.organization_role = userData.organizationRole;
    }
    if (userData.isActive !== undefined) {
      updateData.is_active = userData.isActive;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', clerkId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

/**
 * Get user by Clerk ID from Supabase users table
 */
export async function getUserByClerkId(clerkId: string) {
  // In development, provide mock user data if needed
  if (process.env.NODE_ENV === 'development' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ Using mock user data in development (missing SUPABASE_SERVICE_ROLE_KEY)');
    return {
      id: 'mock-user-id',
      organization_id: '1', // Changed to string UUID to match schema
      organization_role: 'admin' as const,
      is_active: true,
      organizations: {
        id: '1', // Changed to string UUID to match schema
      }
    };
  }

  try {
    const { data, error } = await supabaseAdmin
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
      .eq('id', clerkId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error getting user by Clerk ID:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

/**
 * Check if user exists in Supabase users table
 */
export async function userExists(clerkId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', clerkId)
      .single();

    if (error && error.code === 'PGRST116') {
      return false; // No rows returned
    }

    if (error) {
      throw error;
    }

    return !!data;
  } catch (error: any) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}

/**
 * Deactivate a user (soft delete)
 */
export async function deactivateUser(clerkId: string) {
  return updateUser(clerkId, { isActive: false });
}

/**
 * Activate a user
 */
export async function activateUser(clerkId: string) {
  return updateUser(clerkId, { isActive: true });
}

/**
 * Get all users for an organization
 */
export async function getUsersByOrganization(organizationId: string) { // Changed to string UUID to match schema
  try {
    const { data, error } = await supabaseAdmin
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
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error getting users by organization:', error);
    throw new Error(`Failed to get organization users: ${error.message}`);
  }
}

/**
 * Delete a user (soft delete by setting is_active to false)
 */
export async function deleteUser(clerkId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

/**
 * Get user by user ID from Supabase users table
 */
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        clerk_id,
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
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error getting user by ID:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }
}
