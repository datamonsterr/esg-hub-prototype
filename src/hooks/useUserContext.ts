import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserByClerkId } from '../lib/user-utils';

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
export function useUserContext(): UserContextData {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserContextData>({
    userId: '',
    isLoading: true,
  });

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      setUserData({
        userId: '',
        isLoading: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Fetch user data from our API
    const fetchUserData = async () => {
      try {
        const data = await getUserByClerkId(user.id);
        if (!data) {
            throw new Error('Failed to fetch user data');
        }
        
        setUserData({
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          organizationId: data?.organization_id,
          organizationRole: data.organization_role,
          isActive: data.is_active,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch user data',
        });
      }
    };

    fetchUserData();
  }, [user, isLoaded]);

  return userData;
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
