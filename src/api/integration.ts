'use client';

import { ComponentNode } from '@/src/types/product';
import { useEffect } from 'react';
import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';
import {
  ActivityWithProduct,
  Actor,
  DataIntegrationsData,
  DocumentSummaryData,
  DynamicTable,
  FilePreviewData,
  FileUploadData,
  KeyHighlightsData,
  ProcessedDocument
} from '../types/integration';
import axiosInstance, { endpoints } from './axios';
import { useUpdateProduct } from './product';

// #region RAW API
export const getDataIntegrations = async () => {
  const res = await axiosInstance.get(endpoints.integration.base);
  return res.data;
};

export const getFileUpload = async () => {
  const res = await axiosInstance.get(endpoints.integration.fileUpload);
  return res.data;
};

export const getActivityById = async (id: string) => {
  const res = await axiosInstance.get(
    `${endpoints.integration.activities}/${id}`,
  );
  return res.data;
};

export const getDocumentById = async (id: string) => {
  const res = await axiosInstance.get(endpoints.documents.processed + `/${id}`);
  return res.data;
};

export const getFilePreview = async (url: string) => {
  const res = await axiosInstance.get(url);
  return res.data;
};

export const getKeyHighlights = async (url: string) => {
  const res = await axiosInstance.get(url);
  return res.data;
};

export const createDocument = async (
  url: string,
  { arg }: { arg: { id: string; fileName: string; fileExtension: string } }
) => {
  const { id, fileName, fileExtension } = arg;
  
  // Create processed document entry with comprehensive mock data
  const newProcessedDoc = {
    id,
    fileName,
    description: `Processed document: ${fileName}`,
    actors: [
      {
        id: 1,
        title: "Supplier",
        description: "GreenTech Materials Ltd",
        color: "bg-blue-50 text-blue-900",
        dotColor: "bg-blue-500"
      },
      {
        id: 2,
        title: "Brand",
        description: "EcoSustain Corp",
        color: "bg-green-50 text-green-900",
        dotColor: "bg-green-500"
      },
      {
        id: 3,
        title: "Auditor",
        description: "ESG Certification Body",
        color: "bg-purple-50 text-purple-900",
        dotColor: "bg-purple-500"
      }
    ],
    available_actions: [
      {
        id: 1,
        title: "Manufacturing",
        code: "MFG-2024-001",
        type: "manufacturing",
        color: "bg-green-100 text-green-800"
      },
      {
        id: 2,
        title: "Transportation",
        code: "TRN-2024-002",
        type: "transportation",
        color: "bg-yellow-100 text-yellow-800"
      },
      {
        id: 3,
        title: "Certification",
        code: "CERT-2024-003",
        type: "certification",
        color: "bg-purple-100 text-purple-800"
      }
    ],
    sections: [
      {
        title: "File Preview",
        type: "file-preview",
        contentUrl: `/file-previews/${id}`
      },
      {
        title: "Key Highlights",
        type: "key-highlights",
        contentUrl: `/key-highlights-data/${id}`
      },
      {
        title: "Document Summary",
        type: "document-summary",
        contentUrl: `/document-summary/${id}`
      }
    ]
  };

  // Create all entries in parallel
  const [processedDocResponse] = await Promise.all([
    axiosInstance.post(endpoints.documents.processed, newProcessedDoc),
    
    // Create file preview data with comprehensive mock content
    axiosInstance.post(endpoints.documents.previews, {
      id,
      fileName,
      fileSize: "Processing...",
      data: [
        {
          material: "Organic Cotton",
          origin: "India - Gujarat",
          supplier: "GreenTech Materials Ltd",
          cert: "GOTS Certified",
          date: new Date().toISOString().split('T')[0],
          qty: 2500,
          unit: "kg",
          status: "processing"
        },
        {
          material: "Recycled Polyester",
          origin: "Japan - Osaka",
          supplier: "EcoFiber Corp",
          cert: "GRS Certified",
          date: new Date().toISOString().split('T')[0],
          qty: 1800,
          unit: "kg",
          status: "processing"
        },
        {
          material: "Natural Dyes",
          origin: "Peru - Lima",
          supplier: "Natural Colors Ltd",
          cert: "OEKO-TEX",
          date: new Date().toISOString().split('T')[0],
          qty: 50,
          unit: "L",
          status: "processing"
        }
      ]
    }),
    
    // Create key highlights data with comprehensive mock content
    axiosInstance.post(endpoints.dataValidation.keyHighlights, {
      id,
      highlights: [
        {
          title: "Document uploaded and ready for processing",
          percentage: 100,
          status: "success",
          suggestion: "Process",
          detail: "File successfully uploaded and stored for ESG compliance analysis"
        },
        {
          title: "Supply chain data detected - 3 suppliers identified",
          percentage: 85,
          status: "info",
          suggestion: "Review",
          detail: "Found material sourcing data from GreenTech Materials, EcoFiber Corp, and Natural Colors Ltd"
        },
        {
          title: "Certification validation in progress",
          percentage: 60,
          status: "warning",
          suggestion: "Monitor",
          detail: "Validating GOTS, GRS, and OEKO-TEX certifications for compliance"
        }
      ]
    }),
    
    // Create document summary data with comprehensive mock content
    axiosInstance.post(endpoints.documents.summary, {
      id,
      description: `ESG compliance report for ${fileName} covering supply chain traceability, material origins, and certification status. Document includes comprehensive data from 3 key suppliers across multiple regions with detailed material sourcing information.`,
      reportingPeriod: "2024 Q1",
      organizationCount: 3,
      keyMetrics: [
        {
          name: "Material Traceability",
          value: "85",
          unit: "%",
          category: "compliance"
        },
        {
          name: "Supplier Certifications",
          value: "3",
          unit: "active",
          category: "certification"
        },
        {
          name: "Carbon Footprint",
          value: "2.4",
          unit: "tCO2e",
          category: "environmental"
        },
        {
          name: "Processing Status",
          value: "In Progress",
          unit: "status",
          category: "system"
        }
      ],
      dataQuality: {
        completeness: 75,
        accuracy: 82,
        consistency: 78
      }
    }),

    // Create document actors data
    axiosInstance.post(endpoints.documents.actors, {
      id,
      documentId: id,
      actors: [
        {
          id: 1,
          title: "Primary Supplier",
          description: "GreenTech Materials Ltd",
          color: "bg-blue-50 text-blue-900",
          dotColor: "bg-blue-500"
        },
        {
          id: 2,
          title: "Brand Owner",
          description: "EcoSustain Corp",
          color: "bg-green-50 text-green-900",
          dotColor: "bg-green-500"
        },
        {
          id: 3,
          title: "Auditor",
          description: "ESG Certification Body",
          color: "bg-purple-50 text-purple-900",
          dotColor: "bg-purple-500"
        },
        {
          id: 4,
          title: "Logistics Provider",
          description: "Sustainable Transport Co",
          color: "bg-yellow-50 text-yellow-900",
          dotColor: "bg-yellow-500"
        }
      ]
    }),

    // Create document actions data
    axiosInstance.post(endpoints.documents.actions, {
      id,
      documentId: id,
      actions: [
        {
          id: 1,
          title: "Sustainability Audit",
          code: `SUSTAIN-AUDIT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          type: "audit",
          color: "bg-green-100 text-green-800"
        },
        {
          id: 2,
          title: "Supply Chain Mapping",
          code: `SUPPLY-MAP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          type: "traceability",
          color: "bg-blue-100 text-blue-800"
        },
        {
          id: 3,
          title: "Carbon Footprint Assessment",
          code: `CARBON-ASSESS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          type: "environmental",
          color: "bg-purple-100 text-purple-800"
        },
        {
          id: 4,
          title: "Certification Verification",
          code: `CERT-VERIFY-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          type: "certification",
          color: "bg-orange-100 text-orange-800"
        }
      ]
    }),

    // Create document table data
    axiosInstance.post(endpoints.documents.tables, {
      id,
      documentId: id,
      title: `${fileName} - Supply Chain Analysis`,
      columns: ["Material", "Supplier", "Origin", "Certification", "Quantity", "Unit", "Sustainability Score", "Status"],
      data: [
        {
          id: "row-1",
          Material: "Organic Cotton",
          Supplier: "GreenTech Materials Ltd",
          Origin: "India - Gujarat",
          Certification: "GOTS Certified",
          Quantity: "2500",
          Unit: "kg",
          "Sustainability Score": "9.1",
          Status: "Processing"
        },
        {
          id: "row-2",
          Material: "Recycled Polyester",
          Supplier: "EcoFiber Corp",
          Origin: "Japan - Osaka",
          Certification: "GRS Certified",
          Quantity: "1800",
          Unit: "kg",
          "Sustainability Score": "8.7",
          Status: "Processing"
        },
        {
          id: "row-3",
          Material: "Natural Dyes",
          Supplier: "Natural Colors Ltd",
          Origin: "Peru - Lima",
          Certification: "OEKO-TEX",
          Quantity: "50",
          Unit: "L",
          "Sustainability Score": "9.3",
          Status: "Processing"
        },
        {
          id: "row-4",
          Material: "Bamboo Fiber",
          Supplier: "Sustainable Bamboo Co",
          Origin: "Vietnam - Mekong Delta",
          Certification: "FSC Certified",
          Quantity: "800",
          Unit: "kg",
          "Sustainability Score": "8.9",
          Status: "Processing"
        }
      ]
    })
  ]);
  

  return processedDocResponse.data;
};

// #endregion

// #region SWR
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

export function useGetDataIntegrations() {
  const { data, error, isLoading } = useSWR<DataIntegrationsData>(
    endpoints.integration.base,
    fetcher,
  );

  return {
    dataIntegrations: data,
    isLoading,
    isError: error,
  };
}

export function useGetFileUpload() {
  const { data, error, isLoading } = useSWR<FileUploadData>(
    endpoints.integration.fileUpload,
    fetcher,
  );

  return {
    fileUpload: data,
    isLoading,
    isError: error,
  };
}

export function useGetActivityStatus(activityId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ActivityWithProduct>(
    activityId ? `${endpoints.integration.activities}/${activityId}` : null,
    fetcher,
    {
      refreshInterval: (latestData) => {
        if (latestData?.status === 'processing') return 2000;
        return 0;
      },
    },
  );
  
  const { updateProduct } = useUpdateProduct();

  useEffect(() => {
    if (data?.status === 'processing' && data.productId) {
      const { productId } = data;
      // This logic should be on the backend, but we simulate it here for now.
      const processDocument = async () => {
        try {
          // Simulate processing time
          await new Promise((resolve) => setTimeout(resolve, 5000));
          
          const { data: filePreview } = await axiosInstance.get<FilePreviewData>(`/file-previews/${data.id}`);

          const productToUpdate = await axiosInstance.get(`/products/${productId}`).then(res => res.data);

          const newComponents: ComponentNode[] = filePreview.data.map((item: any) => ({
            id: uuidv4(),
            name: item.material,
            quantity: item.qty,
            organizationId: productToUpdate.organizationId,
            type: 'raw_material',
            description: `Sourced from ${item.supplier}`,
            unit: item.unit,
            metadata: {
              originCountry: item.origin,
              certifications: [item.cert],
            },
            dataCompleteness: 75,
            missingDataFields: ['carbon_footprint'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            children: [],
          }));

          const updatedProduct = {
            ...productToUpdate,
            children: [...(productToUpdate.children || []), ...newComponents],
          };
          
          await updateProduct(productId, updatedProduct);

          await axiosInstance.patch(
            `${endpoints.integration.activities}/${data.id}`,
            { status: 'success' },
          );
          mutate();
        } catch (e) {
          console.error('Failed to simulate document processing', e);
          if (data?.id) {
            await axiosInstance.patch(
              `${endpoints.integration.activities}/${data.id}`,
              { status: 'failed' },
            );
            mutate();
          }
        }
      };

      processDocument();
    }
  }, [data, mutate]);

  return {
    activity: data,
    isLoading,
    isError: error,
  };
}

export function useGetDocument(id: string) {
  const { data, error, isLoading } = useSWR<ProcessedDocument>(
    id ? endpoints.documents.processed + `/${id}` : null,
    fetcher,
  );

  return {
    document: data,
    isLoading,
    isError: error,
  };
}

export function useGetFilePreview(url: string | undefined) {
  const { data, error, isLoading } = useSWR<FilePreviewData>(url, fetcher);

  return {
    filePreview: data,
    isLoading,
    isError: error,
  };
}

export function useGetKeyHighlights(url: string | undefined) {
  const { data, error, isLoading } = useSWR<KeyHighlightsData>(url, fetcher);

  return {
    keyHighlights: data,
    isLoading,
    isError: error,
  };
}

export function useGetDocumentSummary(url: string | undefined) {
  const { data, error, isLoading } = useSWR<DocumentSummaryData>(
    url,
    async (fetchUrl: string) => {
      // Extract ID from URL like "/document-summary/c983ee50-0c80-43aa-b6c8-6d24e974dab9"
      const id = fetchUrl.split('/').pop();
      const response = await fetcher(`${endpoints.documents.summary}/${id}`);
      return response;
    }
  );

  return {
    documentSummary: data,
    isLoading,
    isError: error,
  };
}

export function useGetActors(documentId: string | undefined) {
  const { data, error, isLoading } = useSWR<Actor[]>(
    documentId ? `${endpoints.documents.processed}/${documentId}` : null,
    async (url: string) => {
      try {
        const response = await fetcher(url);
        
        if (response?.actors && Array.isArray(response.actors) && response.actors.length > 0) {
          return response.actors;
        }
        
        if (response?.actors && !Array.isArray(response.actors)) {
          return [];
        }
        return [];
        
      } catch (error) {
        console.error('Error in useGetActors:', error);
        return [];
      }
    }
  );

  return {
    actors: data,
    isLoading,
    isError: error,
  };
}

export function useGetDynamicTable(documentId: string | undefined) {
  const { data, error, isLoading } = useSWR<DynamicTable>(
    documentId ? `${endpoints.documents.previews}/${documentId}` : null,
    async (url: string): Promise<DynamicTable> => {
      try {
        const previewResponse = await fetcher(url);
        
        console.log('File Preview API Response for Dynamic Table:', previewResponse); // Debug log
        
        // Check if file preview data exists and is properly structured
        if (previewResponse?.data && Array.isArray(previewResponse.data) && previewResponse.data.length > 0) {
          console.log('Found valid file preview data:', previewResponse.data); // Debug log
          
          const tableData: DynamicTable = {
            title: `${previewResponse.fileName || 'Document'} - Data Table`,
            columns: ['Material', 'Origin', 'Supplier', 'Certification', 'Date', 'Quantity', 'Unit', 'Status'],
            data: previewResponse.data.map((item: any, index: number) => ({
              id: `row-${index + 1}`,
              Material: item.material || '-',
              Origin: item.origin || '-',
              Supplier: item.supplier || '-',
              Certification: item.cert || '-',
              Date: item.date || '-',
              Quantity: item.qty?.toString() || '-',
              Unit: item.unit || '-',
              Status: item.status || '-',
            }))
          };
          
          console.log('Generated table data:', tableData); // Debug log
          return tableData;
        }
        
        // If no valid data found, return fallback structure
        console.warn('No valid file preview data found:', previewResponse); // Debug log
        return {
          title: 'No Data Available',
          columns: ['Status'],
          data: [{ id: 'no-data', Status: 'No table data available for this document' }]
        };
        
      } catch (error) {
        console.error('Error in useGetDynamicTable:', error);
        return {
          title: 'Error Loading Table',
          columns: ['Error'],
          data: [{ id: 'error-1', Error: 'Failed to load table data' }]
        };
      }
    }
  );

  return {
    dynamicTable: data,
    isLoading,
    isError: error,
  };
}

export function useGetActions(documentId: string | undefined) {
  const { data, error, isLoading } = useSWR<any[]>(
    documentId ? `${endpoints.documents.actions}/${documentId}` : null,
    async (url: string) => {
      try {
        const response = await fetcher(url);
        
        if (response?.actions && Array.isArray(response.actions) && response.actions.length > 0) {
          return response.actions;
        }
        
        if (response?.actions && !Array.isArray(response.actions)) {
          return [];
        }
        return [];
        
      } catch (error) {
        console.error('Error in useGetActions:', error);
        return [];
      }
    }
  );

  return {
    actions: data,
    isLoading,
    isError: error,
  };
}

// --- Mock Extracted Product Tree API ---
export const getExtractedProductTree = async (activityId: string) => {
  // For demo, just return a static product/component tree with suppliers from db.json
  // In real app, this would be based on the uploaded file and extraction process
  const { data: products } = await axiosInstance.get('/products');
  const { data: components } = await axiosInstance.get('/components');
  const { data: orgs } = await axiosInstance.get('/organizations');
  // Pick the first product as the extracted one
  const product = products[0];
  // Get all components for this product
  const productComponents = components.filter((c: any) => c.productId === product.id);
  // Attach supplier info
  const componentsWithSupplier = productComponents.map((c: any) => ({
    ...c,
    supplier: orgs.find((o: any) => o.id === c.supplierOrganizationId) || null
  }));
  return {
    activityId,
    product: {
      ...product,
      components: componentsWithSupplier
    }
  };
};

export function useGetExtractedProductTree(activityId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    activityId ? endpoints.integration.extractedProductTree(activityId) : null,
    () => activityId ? getExtractedProductTree(activityId) : null
  );
  return {
    extractedTree: data,
    isLoading,
    isError: error,
    mutate,
  };
}
// #endregion 