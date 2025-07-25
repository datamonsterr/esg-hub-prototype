export interface DataIntegrationsData {
    integrationMethods: IntegrationMethod[];
    popularIntegrations: PopularIntegration[];
  }
  
  export interface IntegrationMethod {
    icon: string;
    title: string;
    description: string;
    tags: string[];
    action: string;
    onClick?: string;
  }
  
  export interface PopularIntegration {
    name: string;
    description: string;
    icon: string;
    color: string;
  }
  
  export interface IntegrationActivity {
    id: number; // SERIAL PRIMARY KEY
    organization_id: number; // Foreign key to organizations table
    title: string;
    subtitle?: string | null; // Nullable as per schema
    status: 'success' | 'processing' | 'completed' | 'failed';
    created_at: string; // TIMESTAMPTZ
  }

  // Client-side interface with camelCase for better TypeScript usage
  export interface IntegrationActivityClient {
    id: number;
    organizationId: number;
    title: string;
    subtitle?: string | null;
    status: 'success' | 'processing' | 'completed' | 'failed';
    createdAt: string;
  }

  export interface FileUpload {
    id: number; // SERIAL PRIMARY KEY
    organizationId: number;
    originalFilename: string;
    storedFilename: string;
    filePath: string;
    fileSize: number;
    mimeType?: string | null;
    description?: string | null;
    uploadStatus: string; // "uploaded", "processing", "processed", "failed"
    processingStatus: string; // "pending", "processing", "completed", "failed"
    extractedData: any; // JSONB
    metadata: any; // JSONB
    uploadedBy?: string | null; // Clerk user ID
    createdAt: string;
    updatedAt: string;
  }

  export interface ProcessedDocument {
    id: string;
    fileName: string;
    description: string;
    actors: Actor[];
    available_actions: Action[];
    sections: Section[];
  }
  
  export interface Actor {
    id: number;
    title: string;
    description: string;
    color: string;
    dotColor: string;
  }
  
  export interface Action {
    id: number;
    title: string;
    code: string;
    type: string;
    color: string;
  }
  
  export interface Section {
    title: string;
    type: string;
    contentUrl: string;
  }
  
  export interface FilePreviewData {
    id: string;
    fileName: string;
    fileSize: string;
    data: FilePreviewRow[];
  }
  
  export interface FilePreviewRow {
    material: string;
    origin: string;
    supplier: string;
    cert: string;
    date: string;
    qty: number;
    unit: string;
    status: string;
  }
  
  export interface KeyHighlightsData {
    id: string;
    highlights: Highlight[];
  }
  
  export interface Highlight {
    title: string;
    percentage: number;
    status: string;
    suggestion: string;
    detail: string;
  }

  export interface FileUploadData {
    fileTypes: FileType[];
  }
  
  export interface FileType {
    id: string;
    title: string;
    description: string;
    icon: string;
    iconColor: string;
    badge: string;
    badgeColor: string;
  }

  export interface DocumentSummaryData {
    description: string;
    reportingPeriod: string;
    organizationCount: number;
    keyMetrics: KeyMetric[];
    dataQuality: DataQuality;
  }

  export interface KeyMetric {
    name: string;
    value: string;
    unit: string;
    category: string;
  }

  export interface DataQuality {
    completeness: number;
    accuracy: number;
    consistency: number;
  }

  export interface DynamicTableData {
    [key: string]: string | number;
    id: string;
  }

  export interface DynamicTable {
    title: string;
    columns: string[];
    data: DynamicTableData[];
  } 

export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  status: 'processing' | 'completed' | 'failed';
  extractedData?: any;
}

export interface DocumentAttachment {
  productId: string;
  documentId: string;
} 

export interface ActivityWithProduct extends IntegrationActivity {
  productId?: string;
} 