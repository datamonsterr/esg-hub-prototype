import { Product } from './product';
import type { Organization } from './common';
import { UserProfile, InviteRequest } from './user';
import { Assessment, AssessmentTemplate } from './assessment';
import { TraceabilityRequest, TraceabilityResponse } from './traceability';

// Database record types (copied from database.ts)
export interface DbProduct {
  id: string;
  organization_id: string;
  parent_ids?: string[] | null;
  children_ids?: string[] | null;
  name: string;
  sku?: string | null;
  description?: string | null;
  category?: string | null;
  type: "raw_material" | "sub_assembly" | "component" | "final_product";
  quantity: number;
  unit: string;
  metadata: any;
  data_completeness: number;
  missing_data_fields?: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbOrganization {
  id: string;
  name: string;
  address?: string | null;
  email?: string | null;
  created_at: string;
}

export interface DbUser {
  id: string; // Clerk user ID
  organization_id: string;
  organization_role: "admin" | "employee";
  is_active: boolean;
}

export interface DbOrganizationInvite {
  id: string;
  email: string;
  organization_id: string;
  organization_role: "admin" | "employee";
  invited_by: string;
  status: "pending" | "sent" | "accepted" | "expired";
  token: string;
  expires_at: string;
  created_at: string;
}

export interface DbAssessmentTemplate {
  id: string;
  created_by_organization_id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  recommended: boolean;
  last_used?: string | null;
  tags?: string[] | null;
  schema: any;
  created_at: string;
  updated_at: string;
}

export interface DbAssessment {
  id: string;
  template_id: string;
  organization_id: string;
  requesting_organization_id?: string | null;
  title: string;
  description?: string | null;
  topic?: string | null;
  status: "draft" | "in_progress" | "complete";
  priority: "low" | "medium" | "high" | "urgent";
  product_ids?: string[] | null;
  created_by: string;
  due_date?: string | null;
  completed_at?: string | null;
  data_completeness: number;
  created_at: string;
  updated_at: string;
}

export interface DbTraceabilityRequest {
  id: string;
  requesting_organization_id: string;
  target_organization_id: string;
  product_ids?: string[] | null;
  assessment_id: string;
  parent_request_id?: string | null;
  status: "pending" | "in_progress" | "completed" | "rejected" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string | null;
  message?: string | null;
  cascade_settings: any;
  created_at: string;
  updated_at: string;
}

export interface DbAssessmentResponse {
  id: string;
  assessment_id: string;
  trace_request_id?: string | null;
  responding_organization_id: string;
  submitted_by_user_id: string;
  response_data: any;
  attachments?: string[] | null;
  submitted_at: string;
  created_at: string;
}

// Product transformations
export function transformProductFromDb(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    organizationId: dbProduct.organization_id,
    parentIds: dbProduct.parent_ids,
    childrenIds: dbProduct.children_ids,
    name: dbProduct.name,
    sku: dbProduct.sku,
    description: dbProduct.description,
    category: dbProduct.category,
    type: dbProduct.type,
    quantity: dbProduct.quantity,
    unit: dbProduct.unit,
    metadata: dbProduct.metadata,
    dataCompleteness: dbProduct.data_completeness,
    missingDataFields: dbProduct.missing_data_fields,
    status: dbProduct.status,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    children: []
  };
}

export function transformProductToDb(product: Product): DbProduct {
  return {
    id: product.id,
    organization_id: product.organizationId,
    parent_ids: product.parentIds,
    children_ids: product.childrenIds,
    name: product.name,
    sku: product.sku,
    description: product.description,
    category: product.category,
    type: product.type,
    quantity: product.quantity,
    unit: product.unit,
    metadata: product.metadata,
    data_completeness: product.dataCompleteness,
    missing_data_fields: product.missingDataFields,
    status: product.status,
    created_at: product.createdAt,
    updated_at: product.updatedAt
  };
}

// Organization transformations
export function transformOrganizationFromDb(dbOrg: DbOrganization): Organization {
  return {
    id: dbOrg.id,
    name: dbOrg.name,
    address: dbOrg.address || undefined,
    contactEmail: dbOrg.email || undefined,
    createdAt: dbOrg.created_at,
    updatedAt: dbOrg.created_at
  };
}

export function transformOrganizationToDb(org: Organization): DbOrganization {
  return {
    id: org.id,
    name: org.name,
    address: org.address,
    email: org.contactEmail,
    created_at: org.createdAt
  };
}

// User transformations
export function transformUserFromDb(dbUser: DbUser): Partial<UserProfile> {
  return {
    id: dbUser.id,
    organizationId: dbUser.organization_id,
    organizationRole: dbUser.organization_role,
    isActive: dbUser.is_active
  };
}

export function transformUserToDb(user: Partial<UserProfile>): Partial<DbUser> {
  const dbUser: Partial<DbUser> = {};
  
  if (user.id !== undefined) dbUser.id = user.id;
  if (user.organizationId !== undefined) dbUser.organization_id = user.organizationId;
  if (user.organizationRole !== undefined) dbUser.organization_role = user.organizationRole;
  if (user.isActive !== undefined) dbUser.is_active = user.isActive;
  
  return dbUser;
}

// Organization invite transformations
export function transformInviteFromDb(dbInvite: DbOrganizationInvite): InviteRequest {
  return {
    id: dbInvite.id,
    email: dbInvite.email,
    organizationId: dbInvite.organization_id,
    organizationRole: dbInvite.organization_role,
    invitedBy: dbInvite.invited_by,
    status: dbInvite.status,
    token: dbInvite.token,
    expiresAt: dbInvite.expires_at,
    createdAt: dbInvite.created_at
  };
}

export function transformInviteToDb(invite: InviteRequest): Partial<DbOrganizationInvite> {
  return {
    id: invite.id,
    email: invite.email,
    organization_id: invite.organizationId,
    organization_role: invite.organizationRole,
    invited_by: invite.invitedBy,
    status: invite.status,
    token: invite.token,
    expires_at: invite.expiresAt,
    created_at: invite.createdAt
  };
}

// Traceability request transformations
export function transformTraceabilityRequestFromDb(dbRequest: DbTraceabilityRequest): TraceabilityRequest {
  return {
    id: dbRequest.id,
    requestingOrganizationId: dbRequest.requesting_organization_id,
    targetOrganizationId: dbRequest.target_organization_id,
    productIds: dbRequest.product_ids,
    assessmentId: dbRequest.assessment_id,
    parentRequestId: dbRequest.parent_request_id,
    status: dbRequest.status,
    priority: dbRequest.priority,
    dueDate: dbRequest.due_date,
    message: dbRequest.message,
    cascadeSettings: dbRequest.cascade_settings,
    createdAt: dbRequest.created_at,
    updatedAt: dbRequest.updated_at
  };
}

export function transformTraceabilityRequestToDb(request: TraceabilityRequest): DbTraceabilityRequest {
  return {
    id: request.id,
    requesting_organization_id: request.requestingOrganizationId,
    target_organization_id: request.targetOrganizationId,
    product_ids: request.productIds,
    assessment_id: request.assessmentId,
    parent_request_id: request.parentRequestId,
    status: request.status,
    priority: request.priority,
    due_date: request.dueDate,
    message: request.message,
    cascade_settings: request.cascadeSettings,
    created_at: request.createdAt,
    updated_at: request.updatedAt
  };
}

// Assessment response transformations
export function transformAssessmentResponseFromDb(dbResponse: DbAssessmentResponse): TraceabilityResponse {
  return {
    id: dbResponse.id,
    assessmentId: dbResponse.assessment_id,
    traceRequestId: dbResponse.trace_request_id,
    respondingOrganizationId: dbResponse.responding_organization_id,
    submittedByUserId: dbResponse.submitted_by_user_id,
    responseData: dbResponse.response_data,
    attachments: dbResponse.attachments,
    submittedAt: dbResponse.submitted_at,
    createdAt: dbResponse.created_at
  };
}

export function transformAssessmentResponseToDb(response: TraceabilityResponse): DbAssessmentResponse {
  return {
    id: response.id,
    assessment_id: response.assessmentId,
    trace_request_id: response.traceRequestId,
    responding_organization_id: response.respondingOrganizationId,
    submitted_by_user_id: response.submittedByUserId,
    response_data: response.responseData,
    attachments: response.attachments,
    submitted_at: response.submittedAt,
    created_at: response.createdAt
  };
}

// Assessment transformations
export function transformAssessmentFromDb(dbAssessment: DbAssessment): Assessment {
  return {
    id: dbAssessment.id,
    templateId: dbAssessment.template_id,
    organizationId: dbAssessment.organization_id,
    requestingOrganizationId: dbAssessment.requesting_organization_id,
    title: dbAssessment.title,
    description: dbAssessment.description,
    topic: dbAssessment.topic,
    status: dbAssessment.status,
    priority: dbAssessment.priority,
    productIds: dbAssessment.product_ids,
    createdBy: dbAssessment.created_by,
    dueDate: dbAssessment.due_date,
    completedAt: dbAssessment.completed_at,
    dataCompleteness: dbAssessment.data_completeness,
    createdAt: dbAssessment.created_at,
    updatedAt: dbAssessment.updated_at
  };
}

export function transformAssessmentToDb(assessment: Assessment): DbAssessment {
  return {
    id: assessment.id,
    template_id: assessment.templateId,
    organization_id: assessment.organizationId,
    requesting_organization_id: assessment.requestingOrganizationId,
    title: assessment.title,
    description: assessment.description,
    topic: assessment.topic,
    status: assessment.status,
    priority: assessment.priority,
    product_ids: assessment.productIds,
    created_by: assessment.createdBy,
    due_date: assessment.dueDate,
    completed_at: assessment.completedAt,
    data_completeness: assessment.dataCompleteness,
    created_at: assessment.createdAt,
    updated_at: assessment.updatedAt
  };
}

// Assessment template transformations
export function transformAssessmentTemplateFromDb(dbTemplate: DbAssessmentTemplate): AssessmentTemplate {
  return {
    id: dbTemplate.id,
    createdByOrganizationId: dbTemplate.created_by_organization_id,
    title: dbTemplate.title,
    description: dbTemplate.description,
    icon: dbTemplate.icon,
    recommended: dbTemplate.recommended,
    lastUsed: dbTemplate.last_used,
    tags: dbTemplate.tags,
    schema: dbTemplate.schema,
    createdAt: dbTemplate.created_at,
    updatedAt: dbTemplate.updated_at
  };
}

export function transformAssessmentTemplateToDb(template: AssessmentTemplate): DbAssessmentTemplate {
  return {
    id: template.id,
    created_by_organization_id: template.createdByOrganizationId,
    title: template.title,
    description: template.description,
    icon: template.icon,
    recommended: template.recommended,
    last_used: template.lastUsed,
    tags: template.tags,
    schema: template.schema,
    created_at: template.createdAt,
    updated_at: template.updatedAt
  };
}

// General purpose transformers for generic objects
export function transformFromDb<T>(dbRecord: any): T {
  const result: any = {};
  
  Object.keys(dbRecord).forEach(key => {
    if (key.includes('_')) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = dbRecord[key];
    } else {
      result[key] = dbRecord[key];
    }
  });
  
  return result as T;
}

export function transformToDb<T>(record: any): T {
  const result: any = {};
  
  Object.keys(record).forEach(key => {
    if (/[A-Z]/.test(key)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = record[key];
    } else {
      result[key] = record[key];
    }
  });
  
  return result as T;
}

// Array transformers
export function transformArrayFromDb<T>(dbRecords: any[]): T[] {
  return dbRecords.map(record => transformFromDb<T>(record));
}

export function transformArrayToDb<T>(records: any[]): T[] {
  return records.map(record => transformToDb<T>(record));
}
