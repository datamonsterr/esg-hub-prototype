// Unified Product interface - handles both products and components in the same table
export interface Product {
  [x: string]: any;
  id: number; // SERIAL PRIMARY KEY from schema
  organizationId: number; // organization_id from schema
  parentId?: number | null; // For hierarchical relationships (BOM structure)
  name: string;
  sku?: string | null; // Made optional to match schema
  description?: string | null; // Made optional to match schema
  category?: string | null; // Made optional to match schema
  type: "raw_material" | "sub_assembly" | "component" | "final_product"; // Type field distinguishes between different types
  quantity: number; // Default 1.0 in schema
  unit: string; // Default 'pcs' in schema
  supplierOrganizationId?: number | null; // References organizations table
  metadata: any; // JSONB field for flexible data storage
  dataCompleteness: number; // DECIMAL(5,2) DEFAULT 0.0
  missingDataFields?: string[] | null; // TEXT[] field
  status: string; // DEFAULT 'active'
  createdAt: string; // TIMESTAMPTZ
  updatedAt: string; // TIMESTAMPTZ
  children?: ProductNode[]; // For hierarchical display (computed field)
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
}

// Legacy aliases for backward compatibility
export type Component = Product;
export type ComponentNode = ProductNode;
export type ComponentMetadata = ProductMetadata;

export interface CreateProductRequest {
  organizationId: number; // Changed to number to match schema
  name: string;
  sku?: string; // Made optional since it's nullable in schema
  description?: string; // Made optional since it's nullable in schema
  category?: string; // Made optional since it's nullable in schema
  type?: "raw_material" | "sub_assembly" | "component" | "final_product"; // Added type field
  quantity?: number; // Made optional with default
  unit?: string; // Made optional with default
  parentId?: number | null; // For hierarchical relationships
  supplierOrganizationId?: number | null; // For supplier relationships
  metadata?: Record<string, any>; // For additional data
}
