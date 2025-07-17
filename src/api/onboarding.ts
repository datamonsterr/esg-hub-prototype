'use client';

import { PendingInvitation } from '@/src/types/user';
import useSWR from 'swr';
import axiosInstance, { endpoints } from './axios';

interface AcceptInvitationResponse {
    organizationId: string;
    organizationRole: 'admin' | 'employee';
}

// #region RAW API
export const getPendingInvitations = async (): Promise<PendingInvitation[]> => {
    const res = await axiosInstance.get(endpoints.users.pendingInvitations);
    return res.data;
};

export const acceptInvitation = async (token: string): Promise<AcceptInvitationResponse> => {
    // In a real app, the backend would validate the token, find the invitation,
    // associate the user with the organization, and return the new org details.
    // Here, we'll find the mock invitation and return its details.
    const { data: invitations } = await axiosInstance.get<PendingInvitation[]>(endpoints.users.pendingInvitations);
    const invitation = invitations.find(inv => inv.token === token);

    if (!invitation) {
        throw new Error("Invitation not found");
    }
    
    // This is a mock response. The backend would handle the logic.
    // Instead of POSTing to a new collection, we'll PATCH the existing invitation.
    await axiosInstance.patch(`${endpoints.users.pendingInvitations}/${invitation.id}`, { status: 'accepted', acceptedAt: new Date().toISOString() });

    return {
        organizationId: invitation.organizationId,
        organizationRole: invitation.organizationRole,
    };
};
// #endregion

// #region SWR
export function useGetPendingInvitations() {
    const { data, error, isLoading, mutate } = useSWR<PendingInvitation[]>(
        endpoints.users.pendingInvitations,
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
    const acceptInvite = async (token: string) => {
        return await acceptInvitation(token);
    };

    return { acceptInvitation: acceptInvite };
}
// #endregion
