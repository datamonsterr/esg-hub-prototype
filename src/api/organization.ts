'use client';

import { Organization } from '@/src/types/user';
import { api } from '@/src/utils/api';

// #region tRPC Hooks
export function useGetOrganizations() {
  const {
    data: organizations,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.organization.getOrganizations.useQuery();

  return {
    organizations,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetOrganization() {
  const {
    data: organization,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.organization.getOrganizations.useQuery();

  return {
    organization: organization?.[0], // Get first organization
    isLoading,
    isError,
    mutate,
  };
}

export function useGetOrganizationById(id: string) {
  const {
    data: organization,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.organization.getOrganizationById.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    organization,
    isLoading,
    isError,
    mutate,
  };
}

export function useUpdateOrganization() {
  const updateOrganizationMutation = api.organization.updateOrganization.useMutation();

  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    return await updateOrganizationMutation.mutateAsync({ id, data });
  };

  return {
    updateOrganization,
    isLoading: updateOrganizationMutation.isPending,
    isError: updateOrganizationMutation.error,
  };
}

export function useGetMembers(organizationId: string) {
  const {
    data: members,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.organization.getMembers.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  return {
    members,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetInvites(organizationId: string) {
  const {
    data: invites,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.organization.getInvites.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  return {
    invites,
    isLoading,
    isError,
    mutate,
  };
}

export function useSendInvite() {
  const sendInviteMutation = api.organization.sendInvite.useMutation();

  return {
    sendInvite: sendInviteMutation.mutateAsync,
    isLoading: sendInviteMutation.isPending,
    isError: sendInviteMutation.error,
  };
}

export function useCancelInvite() {
  const cancelInviteMutation = api.organization.cancelInvite.useMutation();

  return {
    cancelInvite: cancelInviteMutation.mutateAsync,
    isLoading: cancelInviteMutation.isPending,
    isError: cancelInviteMutation.error,
  };
}

export function useRemoveMember() {
  const removeMemberMutation = api.organization.removeMember.useMutation();

  return {
    removeMember: removeMemberMutation.mutateAsync,
    isLoading: removeMemberMutation.isPending,
    isError: removeMemberMutation.error,
  };
}

export function useLeaveOrganization() {
  const leaveOrgMutation = api.organization.leaveOrganization.useMutation();

  return {
    leaveOrganization: leaveOrgMutation.mutateAsync,
    isLoading: leaveOrgMutation.isPending,
    isError: leaveOrgMutation.error,
  };
}

// #endregion
