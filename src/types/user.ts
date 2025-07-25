import { Product, ProductNode } from "./product";

export type UserRole = "brand" | "supplier" | "admin";

export interface UserProfile {
  id: string; // Clerk user ID
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  organizationId: number; // Changed to number to match schema
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
  organizationId: number; // Changed to number to match schema
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
  id: number; // Changed to number to match schema (SERIAL PRIMARY KEY)
  email: string;
  organizationId: number; // Changed to number to match schema
  organizationRole: "admin" | "employee";
  invitedBy: string; // Clerk user ID
  status: "pending" | "sent" | "accepted" | "expired";
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface PendingInvitation {
  id: number; // Changed to number to match schema
  email: string;
  organizationId: number; // Changed to number to match schema
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
  organizationId: number; // Changed to number to match schema
  organizationRole: "admin" | "employee";
  organization: Organization;
  permissions: string[];
}

export interface Organization {
  id: number; // Changed to number to match schema (SERIAL PRIMARY KEY)
  name: string;
  type?: string; // Made optional since not in schema
  address?: string; // Made optional to match schema
  contactEmail?: string; // Renamed from email and made optional
  capabilities?: string[]; // Made optional since not in schema
  certifications?: string[]; // Made optional since not in schema
  verificationStatus?: "verified" | "pending" | "unverified"; // Made optional since not in schema
  createdAt: string;
  updatedAt?: string; // Made optional since not in schema
}




export interface ProcessRequest {
  processingId: string;
  selectedProductId?: string;
  extractionType: "product" | "materials" | "bom";
  organizationId: string;
}

export interface ProcessResult {
  id: string;
  status: "processing" | "completed" | "failed";
  extractedData: {
    products: Product[];
    children: Product[]; // Child products/components from unified table
    productTree: ProductNode;
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
  materialCount: number; // Changed from componentCount
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

// API Request/Response types - now using unified Product interface
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  organizationId: number; // Changed to number to match schema
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