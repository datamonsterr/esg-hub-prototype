import type { Organization } from './user';
import type { Product, Component } from './product';
import type { AssessmentTemplate } from './assessment';

export interface TraceabilityRequest {
  id: string;
  requestingOrganizationId: string;
  targetOrganizationId: string;
  productIds: string[];
  componentIds: string[];
  assessmentTemplateId: string;
  status: "pending" | "in_progress" | "completed" | "rejected" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  message?: string;
  cascadeSettings: CascadeSettings;
  createdAt: string;
  updatedAt: string;
}

export interface CascadeSettings {
  enableCascade: boolean;
  targetTiers: string[]; // e.g., ["tier-2", "tier-3"]
  cascadeScope: "all" | "material-specific" | "risk-based";
  cascadeTiming: "immediate" | "after-response" | "manual";
  autoReminder: boolean;
}

export interface TraceabilityResponse {
  id: string;
  requestId: string;
  respondingOrganizationId: string;
  responseData: Record<string, any>;
  attachments: string[];
  submittedAt: string;
  submittedBy: string; // Should be userId
}

export interface TraceabilityRequestDetail extends TraceabilityRequest {
  requestingOrganization: Organization;
  targetOrganization: Organization;
  products: Product[];
  components: Component[];
  assessmentTemplate: AssessmentTemplate;
  responses: TraceabilityResponse[];
  cascadedRequests: TraceabilityRequest[];
}

export interface CreateTraceabilityRequest {
  targetOrganizationId: string;
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
