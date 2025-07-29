import axios from "axios";
import { KeyHighlights } from "../components/validation/key-highlights";
import { actionAsyncStorage } from "next/dist/server/app-render/action-async-storage.external";

const axiosInstance = axios.create({
  baseURL: "/api",
});

export const endpoints = {
  // Organizations
  organizations: {
    base: "/organizations",
    id: (id: string) => `/organizations/${id}`,
    members: (id: string) => `/organizations/${id}/members`,
    invites: (id: string) => `/organizations/${id}/invites`,
    memberById: (orgId: string, memberId: string) =>
      `/organizations/${orgId}/members/${memberId}`,
    inviteById: (orgId: string, inviteId: string) =>
      `/organizations/${orgId}/invites/${inviteId}`,
  },
  // Products (unified table for both products and components)
  products: {
    base: "/products",
    id: (id: string) => `/products/${id}`,
    children: (id: string) => `/products/${id}/children`, // Get child products/components
    dataGaps: (id: string) => `/products/${id}/data-gaps`,
    tree: (id: string) => `/products/${id}/tree`, // Get hierarchical tree
  },
  // Traceability
  traceability: {
    base: "/traceability",
    requests: {
      base: "/traceability/requests",
      id: (id: string) => `/traceability/requests/${id}`,
      respond: (id: string) => `/traceability/requests/${id}/respond`,
      incoming: "/traceability/requests/incoming",
      outgoing: "/traceability/requests/outgoing",
    },
    analytics: "/traceability/requests/analytics",
  },
  // Assessments
  assessment: {
    base: "/assessment",
    id: (id: string) => `/assessment/${id}`,
    template: {
      base: "/assessment/template",
      id: (id: string) => `/assessment/template/${id}`,
    },
  },
  // Data Integration
  integration: {
    base: "/integration",
    activities: "/activities", // Updated to match new API structure
    fileUpload: "/file-upload",
    csvImport: "/csv-import",
    productLink: "/product-link",
    validation: (id: string) => `/integration/validation/${id}`,
  },
  documents: {
    base: "/documents",
    validation: {
      base: "/documents/validation",
      id: (id: string) => `/documents/validation/${id}`,
      tables: (id: string) => `/documents/validation/${id}/tables`,
      keyHighlights: (id: string) =>
        `/documents/validation/${id}/key-highlights`,
      summary: (id: string) => `/documents/validation/${id}/summary`,
      actors: (id: string) => `/documents/validation/${id}/actors`,
      actions: (id: string) => `/documents/validation/${id}/actions`,
      dynamicTable: (id: string) => `/documents/validation/${id}/dynamic-table`,
      filePreview: (id: string) => `/documents/validation/${id}/file-preview`,
      productTree: (id: string) => `/documents/validation/${id}/product-tree`,
    },
  },
  // User Management
  users: {
    base: "/users",
    current: "/users/current",
    id: (id: string) => `/users/${id}`,
    profile: "/users/profile",
    updateRole: (id: string) => `/users/${id}/role`,
    clerk: {
      id: (clerkId: string) => `/users/clerk/${clerkId}`,
      exists: (clerkId: string) => `/users/clerk/${clerkId}/exists`,
      activate: (clerkId: string) => `/users/clerk/${clerkId}/activate`,
      deactivate: (clerkId: string) => `/users/clerk/${clerkId}/deactivate`,
    },
    organization: (organizationId: string) => `/users/organization/${organizationId}`,
  },
  onboard: {
    accept: (id: string) => `/onboard/accept/${id}`,
    pendingInvitations: "/onboard/pending-invitations",
    invite: "/onboard/invite",
    inviteByEmail: (email: string) =>
      `/onboard/invite/${encodeURIComponent(email)}`,
  },
  invites: {
    base: "/invites",
    send: "/invites/send",
    resend: (id: string) => `/invites/${id}/resend`,
    cancel: (id: string) => `/invites/${id}/cancel`,
  },
  notifications: "/notifications",
  supplierAssessmentPage: "/supplier-assessment-page",
};

export default axiosInstance;
