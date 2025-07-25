// Onboarding API Types
export interface AcceptInvitationRequest {
  invitationId: number;
}

export interface AcceptInvitationResponse {
  organizationId: string;
  organizationRole: "admin" | "employee";
  organizationName?: string;
  message?: string;
}

export interface SendInvitationRequest {
  email: string;
  organizationRole?: "admin" | "employee";
  expiresInDays?: number;
}

export interface SendInvitationResponse {
  id: string;
  email: string;
  organizationName: string;
  organizationRole: string;
  expiresAt: string;
  message: string;
}

export interface OnboardingStatusResponse {
  isOnboarded: boolean;
  user?: {
    id: string;
    organizationId: number;
    organizationRole: "admin" | "employee";
    organizationName?: string;
    isActive: boolean;
  };
  pendingInvitations?: PendingInvitationSummary[];
}

export interface PendingInvitationSummary {
  id: number;
  email: string;
  organizationId: number;
  organizationName: string;
  organizationRole: "admin" | "employee";
  expiresAt: string;
  createdAt: string;
}

export interface RevokeInvitationResponse {
  message: string;
}
