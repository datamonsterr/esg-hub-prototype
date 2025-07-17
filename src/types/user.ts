import { Product, Component, ComponentNode } from "./product";

export type UserRole = "brand" | "supplier" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  organizationId: string;
  organizationRole: "admin" | "employee";
  isActive: boolean;
  invitedAt?: string;
  joinedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: "admin" | "employee";
  status: "active" | "pending" | "suspended";
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InviteRequest {
  id: string;
  email: string;
  organizationId: string;
  organizationRole: "admin" | "employee";
  invitedBy: string;
  status: "pending" | "sent" | "accepted" | "expired";
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface PendingInvitation {
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
  organizationRole: "admin" | "employee";
  invitedBy: {
    name: string;
    email: string;
  };
  status: "pending" | "sent" | "accepted" | "expired";
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  organizationId: string;
  organizationRole: "admin" | "employee";
  organization: Organization;
  permissions: string[];
}

export interface Organization {
  id: string;
  name: string;
  type: string; // "manufacturer", "supplier", "brand", etc.
  address: string;
  contactEmail: string;
  capabilities: string[]; // ["manufacturing", "sourcing", "testing"]
  certifications: string[];
  verificationStatus: "verified" | "pending" | "unverified";
  createdAt: string;
  updatedAt: string;
}




export interface ProcessRequest {
  processingId: string;
  selectedProductId?: string;
  extractionType: "product" | "components" | "bom";
  organizationId: string;
}

export interface ProcessResult {
  id: string;
  status: "processing" | "completed" | "failed";
  extractedData: {
    products: Product[];
    components: Component[];
    componentTree: ComponentNode;
  };
  dataQuality: {
    completeness: number;
    accuracy: number;
    missingFields: string[];
  };
  suggestedActions: string[];
}

export interface OrganizationAnalytics {
  productCount: number;
  componentCount: number;
  traceabilityCompleteness: number;
  supplierCount: number;
  customerCount: number;
  dataQualityScore: number;
  recentActivities: Activity[];
  traceabilityTrends: TrendData[];
}

export interface Activity {
  id: string;
  organizationId: string;
  type: string;
  title: string;
  subtitle?: string;
  description: string;
  status: string;
  relatedId?: string;
  createdAt: string;
}

export interface TrendData {
  period: string;
  value: number;
}

// API Request/Response types
export interface CreateComponentRequest {
  productId?: string;
  parentId?: string;
  name: string;
  type: Component['type'];
  description: string;
  quantity: number;
  unit: string;
  supplierOrganizationId?: string;
  metadata?: Record<string, any>;
}

// Auth types for organization-based system
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  organization: Organization;
  permissions: string[];
}

// API Error type
export interface ApiError {
  error: string;
  message: string;
  code: number;
  details?: any;
}

// CSV Import types
export interface CSVImportConfig {
  fields: CSVFieldMapping[];
  productId?: string;
  createNewProduct: boolean;
}

export interface CSVFieldMapping {
  csvColumn: string;
  dataField: string;
  required: boolean;
  transform?: (value: string) => any;
}

// Tree visualization types
export interface TreeNodeData {
  id: string;
  name: string;
  type: string;
  metadata: Record<string, any>;
  children?: TreeNodeData[];
}

// Dashboard types
export interface DashboardData {
  organization: Organization;
  analytics: OrganizationAnalytics;
  recentActivities: Activity[];
  pendingRequests: number;
  dataQualityTrends: TrendData[];
}