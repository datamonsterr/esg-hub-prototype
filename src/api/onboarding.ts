"use client";

import { PendingInvitation } from "@/src/types/user";
import useSWR from "swr";
import axiosInstance, { endpoints } from "./axios";

interface AcceptInvitationResponse {
  organizationId: string;
  organizationRole: "admin" | "employee";
  organizationName?: string;
  message?: string;
}

interface SendInvitationRequest {
  email: string;
  organizationRole?: "admin" | "employee";
  expiresInDays?: number;
}

interface SendInvitationResponse {
  id: string;
  email: string;
  organizationName: string;
  organizationRole: string;
  expiresAt: string;
  message: string;
}

// #region RAW API
export const getPendingInvitations = async (): Promise<PendingInvitation[]> => {
  const res = await axiosInstance.get(endpoints.onboard.pendingInvitations);
  return res.data;
};

export const acceptInvitation = async (
  invitationId: number 
): Promise<AcceptInvitationResponse> => {
  const response = await axiosInstance.post(
    endpoints.onboard.accept(invitationId)
  );
  return response.data;
};

export const sendInvitation = async (
  invitationData: SendInvitationRequest
): Promise<SendInvitationResponse> => {
  const response = await axiosInstance.post(
    endpoints.onboard.inviteByEmail(invitationData.email),
    {
      organizationRole: invitationData.organizationRole,
      expiresInDays: invitationData.expiresInDays,
    }
  );
  return response.data;
};

export const getInvitationsByEmail = async (
  email: string
): Promise<PendingInvitation[]> => {
  const res = await axiosInstance.get(endpoints.onboard.inviteByEmail(email));
  return res.data;
};

export const revokeInvitation = async (
  email: string
): Promise<{ message: string }> => {
  const res = await axiosInstance.delete(
    endpoints.onboard.inviteByEmail(email)
  );
  return res.data;
};

export const getOrganizationInvitations = async (): Promise<
  PendingInvitation[]
> => {
  const res = await axiosInstance.get(endpoints.onboard.invite);
  return res.data;
};
// #endregion

// #region SWR
export function useGetPendingInvitations() {
  const { data, error, isLoading, mutate } = useSWR<PendingInvitation[]>(
    endpoints.onboard.pendingInvitations,
    getPendingInvitations
  );

  return {
    invitations: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAcceptInvitation() {
  const acceptInvite = async (invitationId: number) => {
    return await acceptInvitation(invitationId);
  };

  return { acceptInvitation: acceptInvite };
}
// #endregion
