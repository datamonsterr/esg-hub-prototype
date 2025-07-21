import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
});

export const endpoints = {
  // Organizations
  organizations: {
    base: '/organizations',
    id: (id: string) => `/organizations/${id}`,
    members: (id: string) => `/organizations/${id}/members`,
    invites: (id: string) => `/organizations/${id}/invites`,
    memberById: (orgId: string, memberId: string) => `/organizations/${orgId}/members/${memberId}`,
    inviteById: (orgId: string, inviteId: string) => `/organizations/${orgId}/invites/${inviteId}`,
  },
  // Products
  products: {
    base: '/products',
    id: (id: string) => `/products/${id}`,
    components: (id: string) => `/products/${id}/components`,
    dataGaps: (id: string) => `/products/${id}/data-gaps`,
  },
  // Components
  components: {
    base: '/components',
    id: (id: string) => `/components/${id}`,
    tree: (productId: string) => `/products/${productId}/component-tree`,
    children: (id: string) => `/components/${id}/children`,
    relationships: '/component-relationships',
    dataGaps: (id: string) => `/components/${id}/data-gaps`,
  },
  // Traceability
  traceabilityRequests: {
    base: '/traceability-requests',
    id: (id: string) => `/traceability-requests/${id}`,
    incoming: '/traceability-requests-incoming',
    outgoing: '/traceability-requests-outgoing',
    respond: (id: string) => `/traceability-requests/${id}/respond`,
  },
  // Assessments
  assessments: {
    base: '/assessments', // GET/POST for all assessments
    id: (id: string) => `/assessments/${id}`, // GET/PUT/DELETE for a single assessment
  },
  assessmentTemplates: {
    base: '/assessment-templates', // GET/POST for all templates
    id: (id: string) => `/assessment-templates/${id}`, // GET/PUT/DELETE for a single template
  },
  assessmentFilters: '/assessment-filters',
  // Data Integration
  integration: {
    base: '/integration',
    activities: '/activities',
    fileUpload: '/file-upload',
    csvImport: '/csv-import',
    productLink: '/product-link',
    validation: (id: string) => `/integration/validation/${id}`,
    extractedProductTree: (id: string) => `/extracted-product-tree`,
  },
  dataValidation: {
    base: '/data-validation',
    keyHighlights: '/key-highlights-data',
  },
  documents: {
    processed: '/processed-documents',
    previews: '/file-previews',
    summary: '/document-summary',
    actors: '/document-actors',
    actions: '/document-actions',
    tables: '/document-tables',
  },
  // User Management
  users: {
    base: '/users',
    id: (id: string) => `/users/${id}`,
    profile: '/users/profile',
    updateRole: (id: string) => `/users/${id}/role`,
    pendingInvitations: '/pending-invitations',
    acceptInvitation: '/accepted-invitations',
  },
  invites: {
    base: '/invites',
    send: '/invites/send',
    resend: (id: string) => `/invites/${id}/resend`,
    cancel: (id:string) => `/invites/${id}/cancel`,
  },
  notifications: '/notifications',
};

export default axiosInstance; 