import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === "production" ? "/api" : "/api",
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
  // Products
  products: {
    base: "/products",
    id: (id: string) => `/products/${id}`,
    components: (id: string) => `/products/${id}/components`,
    dataGaps: (id: string) => `/products/${id}/data-gaps`,
  },
  // Components
  components: {
    base: "/components",
    id: (id: string) => `/components/${id}`,
    tree: (productId: string) => `/products/${productId}/component-tree`,
    children: (id: string) => `/components/${id}/children`,
    relationships: "/component-relationships",
    dataGaps: (id: string) => `/components/${id}/data-gaps`,
  },
  // Traceability
  traceabilityRequests: {
    base: "/traceability-requests",
    id: (id: string) => `/traceability-requests/${id}`,
    incoming: "/traceability-requests-incoming",
    outgoing: "/traceability-requests-outgoing",
    respond: (id: string) => `/traceability-requests/${id}/respond`,
  },
  // Assessments
  assessment: {
    base: "/assessment",
    id: (id: string) => `/assessment/${id}`,
    template: {
      base: "/assessment/template",
      id: (id: string) => `/assessment/template/${id}`,
    },
    filter: "/assessment/filter",
  },
  // Data Integration
  integration: {
    base: "/integration",
    activities: "/activities",
    fileUpload: "/file-upload",
    csvImport: "/csv-import",
    productLink: "/product-link",
    validation: (id: string) => `/integration/validation/${id}`,
    extractedProductTree: (id: string) => `/extracted-product-tree`,
  },
  dataValidation: {
    base: "/data-validation",
    keyHighlights: "/key-highlights-data",
  },
  documents: {
    processed: "/processed-documents",
    previews: "/file-previews",
    summary: "/document-summary",
    actors: "/document-actors",
    actions: "/document-actions",
    tables: "/document-tables",
  },
  // User Management
  users: {
    base: "/users",
    id: (id: string) => `/users/${id}`,
    profile: "/users/profile",
    updateRole: (id: string) => `/users/${id}/role`,
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
