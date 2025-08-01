import { api } from '../utils/api';

export interface UserContextData {
  userId: string;
  email?: string;
  organizationId?: string; // Changed to string UUID to match schema
  organizationRole?: "admin" | "employee";
  isActive?: boolean;
  isLoading: boolean;
  error?: string;
}

/**
 * Hook to get user context from Supabase database instead of Clerk unsafeMetadata
 * This replaces the old pattern of using user.unsafeMetadata.organizationId
 */
export function useUserContext() {
  const { data: user, isLoading, error } = api.user.getCurrentUser.useQuery();
  
  return {
    userId: user?.userId,
    email: user?.email,
    organizationId: user?.organizationId,
    organizationRole: user?.organizationRole,
    isActive: user?.isActive,
    isLoading,
    error: error?.message,
  };
}

/**
 * Hook to check if current user is an admin
 */
export function useIsAdmin(): boolean {
  const { organizationRole, isLoading } = useUserContext();
  
  if (isLoading) {
    return false;
  }
  
  return organizationRole === 'admin';
}

/**
 * Hook to get current user's organization ID
 */
export function useOrganizationId(): string | undefined {
  const { organizationId, isLoading } = useUserContext();
  
  if (isLoading) {
    return undefined;
  }
  
  // Fallback to default ID in development environment
  if (organizationId === undefined && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Using fallback organization ID in development');
    return '1'; // Return string ID to match UUID format
  }
  
  return organizationId;
}
