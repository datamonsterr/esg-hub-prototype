'use client';

import { api } from '@/src/utils/api';

// #region RAW API functions (now using tRPC) - kept for compatibility but throw errors
export const getCurrentUser = async () => {
  throw new Error('Use useGetCurrentUser hook instead');
};

export const getUserById = async (id: string) => {
  throw new Error('Use useGetUserById hook instead');
};

export const updateUserProfile = async (data: any) => {
  throw new Error('Use useUpdateProfile hook instead');
};

export const updateUserRole = async (userId: string, role: string) => {
  throw new Error('Use useUpdateUserRole hook instead');
};

export const activateUser = async (userId: string) => {
  throw new Error('Use useActivateUser hook instead');
};

export const deactivateUser = async (userId: string) => {
  throw new Error('Use useDeactivateUser hook instead');
};

// #endregion

// #region tRPC Hooks
export function useGetCurrentUser() {
  const {
    data: user,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.user.getCurrentUser.useQuery();

  return {
    user,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetUsersInOrganization(organizationId?: string) {
  const {
    data: users,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.user.getUsersInOrganization.useQuery({ organizationId });

  return {
    users,
    isLoading,
    isError,
    mutate,
  };
}

export function useUpdateProfile() {
  const updateProfileMutation = api.user.updateProfile.useMutation();

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isLoading: updateProfileMutation.isPending,
    isError: updateProfileMutation.error,
  };
}

export function useUpdateUserRole() {
  const updateUserRoleMutation = api.user.updateUserRole.useMutation();

  const updateUserRole = async (userId: string, role: 'admin' | 'manager' | 'member') => {
    return await updateUserRoleMutation.mutateAsync({ userId, role });
  };

  return {
    updateUserRole,
    isLoading: updateUserRoleMutation.isPending,
    isError: updateUserRoleMutation.error,
  };
}

export function useActivateUser() {
  const activateUserMutation = api.user.activateUser.useMutation();

  return {
    activateUser: activateUserMutation.mutateAsync,
    isLoading: activateUserMutation.isPending,
    isError: activateUserMutation.error,
  };
}

export function useDeactivateUser() {
  const deactivateUserMutation = api.user.deactivateUser.useMutation();

  return {
    deactivateUser: deactivateUserMutation.mutateAsync,
    isLoading: deactivateUserMutation.isPending,
    isError: deactivateUserMutation.error,
  };
}

// Additional user management functions
export function useGetUserOrg() {
  const {
    data: organization,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.user.getCurrentUser.useQuery();

  return {
    organization,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetOrganizationMembers() {
  return api.user.getUsersInOrganization.useQuery({});
}

export function useGetOrganizationInvites() {
  return api.onboarding.getOrganizationInvitations.useQuery();
}

// Legacy function names for compatibility
export const updateMemberRole = async (userId: string, role: string) => {
  throw new Error('Use useUpdateUserRole hook instead');
};

export const removeMember = async (userId: string) => {
  throw new Error('Use useDeactivateUser hook instead');
};

export const cancelInvite = async (inviteId: string) => {
  throw new Error('Use useRevokeInvitation hook instead');
};

export const resendInvite = async (inviteId: string) => {
  throw new Error('Use useSendInvitation hook instead');
};

export const sendInvite = async (data: any) => {
  throw new Error('Use useSendInvitation hook instead');
};

// #endregion
