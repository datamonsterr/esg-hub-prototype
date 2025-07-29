import { InviteRequest, OrganizationMember, UserProfile } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import useSWR from "swr";
import axiosInstance, { endpoints } from "./axios";
import { getOrganizationById } from "./organization";
import { useOrganizationId } from "@/src/hooks/useUserContext";

// User Management API Handlers

// Get organization members
export const getOrganizationMembers = async (
  organizationId: string
): Promise<OrganizationMember[]> => {
  const response = await axiosInstance.get(
    endpoints.organizations.members(organizationId)
  );
  return response.data;
};

// Add member to organization
export const addOrganizationMember = async (
  organizationId: string,
  memberData: Omit<OrganizationMember, "id" | "createdAt" | "updatedAt">
): Promise<OrganizationMember> => {
  const response = await axiosInstance.post(
    endpoints.organizations.members(organizationId),
    memberData
  );
  return response.data;
};

// Update member role
export const updateMemberRole = async (
  organizationId: string,
  memberId: string,
  role: "admin" | "employee"
): Promise<OrganizationMember> => {
  const response = await axiosInstance.put(
    endpoints.organizations.memberById(organizationId, memberId),
    { role }
  );
  return response.data;
};

// Remove member from organization
export const removeMember = async (
  organizationId: string,
  memberId: string
): Promise<void> => {
  await axiosInstance.delete(
    endpoints.organizations.memberById(organizationId, memberId)
  );
};

// Get organization invites
export const getOrganizationInvites = async (
  organizationId: string
): Promise<InviteRequest[]> => {
  const response = await axiosInstance.get(
    endpoints.organizations.invites(organizationId)
  );
  return response.data;
};

// Send invite
export const sendInvite = async (
  inviteData: Omit<
    InviteRequest,
    "id" | "token" | "status" | "createdAt" | "expiresAt"
  >
): Promise<InviteRequest> => {
  const response = await axiosInstance.post(endpoints.invites.send, inviteData);
  return response.data;
};

// Resend invite
export const resendInvite = async (
  inviteId: string
): Promise<InviteRequest> => {
  const response = await axiosInstance.post(endpoints.invites.resend(inviteId));
  return response.data;
};

// Cancel invite
export const cancelInvite = async (inviteId: string): Promise<void> => {
  await axiosInstance.delete(endpoints.invites.cancel(inviteId));
};

// Accept invite
export const acceptInvite = async (
  token: string
): Promise<{ user: UserProfile; organization: any }> => {
  const response = await axiosInstance.post(endpoints.invites.base, { token });
  return response.data;
};

// Get user profile
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get(endpoints.users.profile);
  return response.data;
};

// Update user profile
export const updateUserProfile = async (
  userData: Partial<UserProfile>
): Promise<UserProfile> => {
  const response = await axiosInstance.put(endpoints.users.profile, userData);
  return response.data;
};

// Sync user data for auto-assignment
export const syncUserData = async (userData: {
  email: string;
  organizationId: string;
  organizationRole: string;
  userData?: any;
}): Promise<any> => {
  const response = await axiosInstance.post("/users/sync", userData);
  return response.data;
};

// SWR Hooks

export const useGetOrganizationMembers = (organizationId: string) => {
  return useSWR(
    organizationId ? `organization-members-${organizationId}` : null,
    () => getOrganizationMembers(organizationId)
  );
};

export const useGetOrganizationInvites = (organizationId: string) => {
  return useSWR(
    organizationId ? `organization-invites-${organizationId}` : null,
    () => getOrganizationInvites(organizationId)
  );
};

export const useGetUserProfile = () => {
  return useSWR("user-profile", getUserProfile);
};

export const useGetUserOrg = () => {
  const organizationId = useOrganizationId();
  const { data, error, isLoading, mutate } = useSWR(
    organizationId ? `/organizations/${organizationId}` : null,
    () => getOrganizationById(organizationId!)
  );

  return {
    organization: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// New API handlers for migrated user-utils functions

// Create user
export const createUser = async (userData: {
  clerkId: string;
  organizationId: string;
  organizationRole?: "admin" | "employee";
  isActive?: boolean;
}): Promise<any> => {
  const response = await axiosInstance.post(endpoints.users.base, userData);
  return response.data;
};

// Get user by Clerk ID
export const getUserByClerkId = async (clerkId: string): Promise<any> => {
  const response = await axiosInstance.get(endpoints.users.clerk.id(clerkId));
  return response.data;
};

// Update user by Clerk ID
export const updateUserByClerkId = async (
  clerkId: string,
  userData: {
    organizationId?: string;
    organizationRole?: "admin" | "employee";
    isActive?: boolean;
  }
): Promise<any> => {
  const response = await axiosInstance.put(endpoints.users.clerk.id(clerkId), userData);
  return response.data;
};

// Check if user exists
export const userExists = async (clerkId: string): Promise<{ exists: boolean }> => {
  const response = await axiosInstance.get(endpoints.users.clerk.exists(clerkId));
  return response.data;
};

// Deactivate user
export const deactivateUser = async (clerkId: string): Promise<any> => {
  const response = await axiosInstance.post(endpoints.users.clerk.deactivate(clerkId));
  return response.data;
};

// Activate user
export const activateUser = async (clerkId: string): Promise<any> => {
  const response = await axiosInstance.post(endpoints.users.clerk.activate(clerkId));
  return response.data;
};

// Get users by organization
export const getUsersByOrganization = async (
  organizationId: string,
  includeInactive?: boolean
): Promise<any[]> => {
  const params = includeInactive ? { include_inactive: 'true' } : {};
  const response = await axiosInstance.get(
    endpoints.users.organization(organizationId),
    { params }
  );
  return response.data;
};

// SWR Hooks for new functions

export const useGetUserByClerkId = (clerkId: string | null) => {
  return useSWR(
    clerkId ? `user-clerk-${clerkId}` : null,
    () => getUserByClerkId(clerkId!)
  );
};

export const useUserExists = (clerkId: string | null) => {
  return useSWR(
    clerkId ? `user-exists-${clerkId}` : null,
    () => userExists(clerkId!)
  );
};

export const useGetUsersByOrganization = (organizationId: string | null, includeInactive?: boolean) => {
  return useSWR(
    organizationId ? `users-org-${organizationId}-${includeInactive}` : null,
    () => getUsersByOrganization(organizationId!, includeInactive)
  );
};
