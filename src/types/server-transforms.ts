/**
 * Server-side transformation functions to convert between database records and TypeScript objects
 * These functions are similar to those in database.ts but don't include the "use client" directive
 */

import { Product } from './product';
import type { Organization } from './common';
import { UserProfile, InviteRequest } from './user';

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
