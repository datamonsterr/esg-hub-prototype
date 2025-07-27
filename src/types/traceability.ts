import type { Organization } from './user';
import type { Product, Component } from './product';
import type { Assessment, AssessmentTemplate } from './assessment';

export interface TraceabilityRequest {
  id: string; // Changed to string UUID to match schema
  requestingOrganizationId: string; // Changed to string UUID to match schema
  targetOrganizationId: string; // Changed to string UUID to match schema
  productIds?: string[] | null; // Changed to string UUID array and made nullable to match schema
  assessmentId: string; // Changed to string UUID to match schema
  parentRequestId?: string | null; // Changed to string UUID to match schema
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
  id: string; // Changed to string UUID to match assessment_responses schema
  assessmentId: string; // Changed to string UUID to match schema
  traceRequestId?: string | null; // Changed to string UUID to match schema
  respondingOrganizationId: string; // Changed to string UUID to match schema
  submittedByUserId: string; // Changed to match schema (Clerk user ID)
  responseData: any; // Changed to any to match JSONB
  attachments?: string[] | null; // Made nullable to match schema
  submittedAt: string;
  createdAt: string; // Added to match schema
}

export interface TraceabilityRequestDetail extends TraceabilityRequest {
  requestingOrganization: Organization;
  targetOrganization: Organization;
  products: Product[]; // Products being requested for information
  assessment: Assessment; // Changed from assessmentTemplate to assessment
  responses: TraceabilityResponse[];
  cascadedRequests: TraceabilityRequest[];
}

export interface CreateTraceabilityRequest {
  targetOrganizationId: string; // Changed to string UUID to match schema
  productIds: string[]; // Changed to string UUID array to match schema
  assessmentId: string; // Changed to string UUID to match schema
  priority: TraceabilityRequest['priority'];
  dueDate?: string; // Made optional to match schema
  message?: string;
  cascadeSettings?: any; // Changed to any to match JSONB schema
}

export interface TraceabilityAnalytics {
  keyInsights: string;
  tariffRiskByCountry: { 
    country: string; 
    risk: number;
    riskLevel: string;
    originPercentage: number;
    material: string;
    status: string;
  }[];
  materialTraceability: { material: string; percentage: number }[];
  complianceScore: number;
  supplyChainVisibility: number;
  originTraceabilityTrends?: any[];
  overallStats?: {
    traceabilityPercentage: number;
    tracedCount: number;
    untracedCount: number;
  };
}
