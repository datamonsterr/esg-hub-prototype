export interface Product {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  componentTreeId: string;
  metadata: {
    sustainabilityScore?: number;
    certifications?: string[];
    originCountry?: string;
    carbonFootprint?: number;
    weightKg?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    recycledContent?: number;
    brand?: string;
  };
  dataCompleteness: number;
  missingDataFields: string[];
  createdAt: string;
  updatedAt: string;
  status?: string;
  children?: ComponentNode[];
}

export interface Component {
  id: string;
  organizationId: string;
  productId?: string;
  parentId?: string;
  name: string;
  type: "raw_material" | "sub_assembly" | "component" | "final_product";
  sku?: string;
  description: string;
  quantity: number;
  unit: string;
  supplierOrganizationId?: string;
  metadata: ComponentMetadata;
  dataCompleteness: number;
  missingDataFields: string[];
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
