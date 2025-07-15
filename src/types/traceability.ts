export interface TraceabilityRequest {
  id: string;
  suppliers: string[];
  assessmentId: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  progress: {
    responded: number;
    total: number;
  };
  createdDate: string;
  lastUpdated: string;
  expirationDate: string;
  artifactTags: string[];
  actionTags: string[];
  message?: string;
  cascadeSettings: CascadeSettings;
}

export interface CascadeSettings {
  type: 'required' | 'optional' | 'none';
  targetTiers: string[]; // ['tier-2', 'tier-3', 'tier-4-plus']
  scope: 'material-specific' | 'all-suppliers' | 'risk-based';
  timing: 'immediate' | 'tier1-complete' | '7-days' | '14-days' | '30-days' | 'manual';
  autoReminder: boolean;
  completionNotification: boolean;
}

export interface SupplierResponse {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCategory: string;
  status: 'Fulfilled' | 'Rejected' | 'Pending';
  responseDate?: string;
  rejectionReason?: string;
  responseData?: any;
  tier2Suppliers?: Tier2Supplier[];
}

export interface Tier2Supplier {
  id: string;
  name: string;
  category: string;
  status: 'Cascaded' | 'Pending' | 'Not Applicable';
}

export interface TraceabilityAnalytics {
  keyInsights: string;
  tariffRiskByCountry: CountryRiskData[];
  originTraceabilityTrends: TrendData[];
  materialTraceability: MaterialTraceabilityData[];
  overallStats: {
    traceabilityPercentage: number;
    tracedCount: number;
    untracedCount: number;
  };
}

export interface CountryRiskData {
  country: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  riskScore: number;
  originPercentage: number;
  material: string;
  status: 'At Risk' | 'Secure' | 'Monitoring';
}

export interface TrendData {
  period: string;
  value: number;
}

export interface MaterialTraceabilityData {
  material: string;
  traced: number;
  untraced: number;
  percentage: number;
}

export interface AnalyticsQuery {
  dimensions: string[];
  metrics: string[];
  filters: QueryFilter[];
  timeRange: string;
}

export interface QueryFilter {
  dimension: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  location: string;
  isAnonymous: boolean;
}

export interface MaterialCode {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface ProductCode {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface ActionCode {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface CreateTraceabilityRequest {
  supplierIds: string[];
  assessmentId: string;
  expirationDate: string;
  artifactTags: string[];
  actionTags: string[];
  message?: string;
  cascadeSettings: CascadeSettings;
}

export interface TraceabilityRequestDetail extends TraceabilityRequest {
  supplierResponses: SupplierResponse[];
} 