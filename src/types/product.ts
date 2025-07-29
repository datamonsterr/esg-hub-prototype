// Unified Product interface - handles both products and components in the same table
export interface Product {
  [x: string]: any;
  id: string; // UUID PRIMARY KEY from schema
  organizationId: string; // organization_id from schema (UUID)
  parentIds?: string[] | null; // Array of parent product UUIDs from other organizations that import this product
  childrenIds?: string[] | null; // Array of child product UUIDs for hierarchical relationships
  name: string;
  sku?: string | null; // Made optional to match schema
  description?: string | null; // Made optional to match schema
  category?: string | null; // Made optional to match schema
  type: "raw_material" | "sub_assembly" | "component" | "final_product"; // Type field distinguishes between different types
  quantity: number; // Default 1.0 in schema
  unit: string; // Default 'pcs' in schema
  metadata: any; // JSONB field for flexible data storage
  dataCompleteness: number; // DECIMAL(5,2) DEFAULT 0.0
  missingDataFields?: string[] | null; // TEXT[] field
  status: string; // DEFAULT 'active'
  createdAt: string; // TIMESTAMPTZ
  updatedAt: string; // TIMESTAMPTZ
  children?: ProductNode[]; // For hierarchical display (computed field)
  parents?: ProductNode[]; // For upward hierarchical display (computed field)
  
  // Traceability-related fields (computed at runtime based on trace requests)
  traceabilityStatus?: 'none' | 'pending' | 'approved' | 'rejected'; // Status of traceability requests for this product
  hasDetailedInfo?: boolean; // Whether detailed info is available (based on accepted trace requests)
}

// Metadata interface for product/component additional data
export interface ProductMetadata {
  materialType?: string;
  originCountry?: string;
  certifications: string[];
  sustainabilityScore?: number;
  carbonFootprint?: number;
  recycledContent?: number;
  hazardousSubstances?: string[];
}

// Node interface for hierarchical product structure
export interface ProductNode extends Product {
  children: ProductNode[];
  parents: ProductNode[]; // For upward hierarchical display
}

// Legacy aliases for backward compatibility
export type Component = Product;
export type ComponentNode = ProductNode;
export type ComponentMetadata = ProductMetadata;

export interface CreateProductRequest {
  organizationId: string; // Changed to string UUID to match schema
  name: string;
  sku?: string; // Made optional since it's nullable in schema
  description?: string; // Made optional since it's nullable in schema
  category?: string; // Made optional since it's nullable in schema
  type?: "raw_material" | "sub_assembly" | "component" | "final_product"; // Added type field
  quantity?: number; // Made optional with default
  unit?: string; // Made optional with default
  parentIds?: string[] | null; // Array of parent product UUIDs from other organizations that import this product
  childrenIds?: string[] | null; // Array of child product UUIDs for hierarchical relationships
  metadata?: Record<string, any>; // For additional data
}
