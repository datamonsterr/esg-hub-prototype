import type { Organization } from './user';
import type { Product, Component } from './product';
import type { Assessment, AssessmentTemplate } from './assessment';

export interface TraceabilityRequest {
  id: number; // Changed to number to match schema (SERIAL PRIMARY KEY)
  requestingOrganizationId: number; // Changed to number to match schema
  targetOrganizationId: number; // Changed to number to match schema
  productIds?: number[] | null; // Changed to number array and made nullable to match schema
  assessmentId: number; // Changed to assessmentId (not template) to match schema
  parentRequestId?: number | null; // Added to match schema
  status: "pending" | "in_progress" | "completed" | "rejected" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string | null; // Made nullable to match schema
  message?: string | null; // Made nullable to match schema
  cascadeSettings: any; // Changed to any to match JSONB
  createdAt: string;
  updatedAt: string;
  
  // Removed fields not in schema
  // componentIds: string[];
  // assessmentTemplateId: string;
}

export interface CascadeSettings {
  enableCascade: boolean;
  targetTiers: string[]; // e.g., ["tier-2", "tier-3"]
  cascadeScope: "all" | "material-specific" | "risk-based";
  cascadeTiming: "immediate" | "after-response" | "manual";
  autoReminder: boolean;
}

export interface TraceabilityResponse {
  id: number; // Changed to number to match assessment_responses schema
  assessmentId: number; // Added to match schema
  traceRequestId?: number | null; // Added to match schema
  respondingOrganizationId: number; // Changed to number to match schema
  submittedByUserId: string; // Changed to match schema (Clerk user ID)
  responseData: any; // Changed to any to match JSONB
  attachments?: string[] | null; // Made nullable to match schema
  submittedAt: string;
  createdAt: string; // Added to match schema
}

export interface TraceabilityRequestDetail extends TraceabilityRequest {
  requestingOrganization: Organization;
  targetOrganization: Organization;
  products: Product[];
  components: Component[];
  assessment: Assessment; // Changed from assessmentTemplate to assessment
  responses: TraceabilityResponse[];
  cascadedRequests: TraceabilityRequest[];
}

export interface CreateTraceabilityRequest {
  targetOrganizationId: number; // Changed to number to match schema
  productIds: string[];
  componentIds: string[];
  assessmentTemplateId: string;
  priority: TraceabilityRequest['priority'];
  dueDate: string;
  message?: string;
  cascadeSettings: CascadeSettings;
}

export interface TraceabilityAnalytics {
  keyInsights: string;
  tariffRiskByCountry: { country: string; risk: number }[];
  materialTraceability: { material: string; percentage: number }[];
  complianceScore: number;
  supplyChainVisibility: number;
}
