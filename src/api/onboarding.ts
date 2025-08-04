"use client";

import { api } from "../utils/api";

// #region tRPC API
export function useGetPendingInvitations() {
  return api.onboarding.getPendingInvitations.useQuery();
}

export function useAcceptInvitation() {
  return api.onboarding.acceptInvitation.useMutation();
}

export function useSendInvitation() {
  return api.onboarding.sendInvitation.useMutation();
}

export function useGetInvitationsByEmail(email: string) {
  return api.onboarding.getInvitationsByEmail.useQuery({ email });
}

export function useRevokeInvitation() {
  return api.onboarding.revokeInvitation.useMutation();
}

export function useGetOrganizationInvitations() {
  return api.onboarding.getOrganizationInvitations.useQuery();
}
// #endregion
