export interface Product {
  [x: string]: any;
  id: number; // Changed to number to match schema (SERIAL PRIMARY KEY)
  organizationId: number; // Changed to number to match schema
  parentId?: number | null; // Added to match schema
  name: string;
  sku?: string | null; // Made optional to match schema
  description?: string | null; // Made optional to match schema
  category?: string | null; // Made optional to match schema
  type: string; // Added to match schema
  quantity: number; // Added to match schema
  unit: string; // Added to match schema
  supplierOrganizationId?: number | null; // Changed to number and made optional
  metadata: any; // Changed to any to match JSONB
  dataCompleteness: number;
  missingDataFields?: string[] | null; // Made nullable to match schema
  status: string; // Added to match schema
  createdAt: string;
  updatedAt: string;
  children?: ComponentNode[];
}

export interface Component {
  id: number; // Changed to number to match schema (products table is unified)
  organizationId: number; // Changed to number to match schema
  productId?: string;
  parentId?: number | null; // Changed to number to match schema
  name: string;
  type: "raw_material" | "sub_assembly" | "component" | "final_product";
  sku?: string | null; // Made nullable to match schema
  description?: string | null; // Made nullable to match schema
  quantity: number;
  unit: string;
  supplierOrganizationId?: number | null; // Changed to number to match schema
  metadata: any; // Changed to any to match JSONB
  dataCompleteness: number;
  missingDataFields?: string[] | null; // Made nullable to match schema
  status: string; // Added to match schema
  createdAt: string;
  updatedAt: string;
}

export interface ComponentMetadata {
  materialType?: string;
  originCountry?: string;
  certifications: string[];
  sustainabilityScore?: number;
  carbonFootprint?: number;
  recycledContent?: number;
  hazardousSubstances?: string[];
}

export interface ComponentNode extends Component {
  children: ComponentNode[];
}

export interface CreateProductRequest {
  organizationId: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  metadata?: Record<string, any>;
}
