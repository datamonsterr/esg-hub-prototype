import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export interface UserContextData {
  userId: string;
  email?: string;
  organizationId?: number;
  organizationRole?: "admin" | "employee";
  isActive?: boolean;
  organization?: {
    id: number;
    name: string;
    address?: string;
    email?: string;
    created_at: string;
  };
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
        const response = await fetch('/api/users/current');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        
        setUserData({
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          organizationId: data.organization_id,
          organizationRole: data.organization_role,
          isActive: data.is_active,
          organization: data.organizations,
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
export function useOrganizationId(): number | undefined {
  const { organizationId, isLoading } = useUserContext();
  
  if (isLoading) {
    return undefined;
  }
  
  return organizationId;
}
