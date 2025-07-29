"use client";

import { Product } from './product';
import { Organization } from './common';
import { UserProfile, OrganizationMember, InviteRequest } from './user';
import { Assessment, AssessmentTemplate } from './assessment';
import { Notification } from './notification';
import { TraceabilityRequest, TraceabilityResponse } from './traceability';
import { FileUpload, IntegrationActivity } from './integration';

/**
 * Database record types that match the Supabase schema
 * These types use snake_case as per SQL convention
 * 
 * Note: For transformation functions, see server-transforms.ts
 */

// Database record types
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

export interface DbNotification {
  id: string;
  organization_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  priority: "low" | "medium" | "high";
  action_url?: string | null;
  created_at: string;
}

export interface DbFileUpload {
  id: string;
  organization_id: string;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type?: string | null;
  description?: string | null;
  upload_status: "uploaded" | "processing" | "processed" | "failed";
  processing_status: "pending" | "processing" | "completed" | "failed";
  extracted_data: any;
  metadata: any;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbIntegrationActivity {
  id: string;
  organization_id: string;
  title: string;
  subtitle?: string | null;
  status: "success" | "processing" | "completed" | "failed";
  created_at: string;
}
