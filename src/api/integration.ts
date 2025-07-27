'use client';

import { ProductNode } from '@/src/types/product';
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
  const res = await axiosInstance.get(endpoints.documents.validation.id(id));
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
  const numberId = parseInt(id, 10);
  
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
        contentUrl: endpoints.documents.validation.filePreview(numberId)
      },
      {
        title: "Key Highlights",
        type: "key-highlights",
        contentUrl: endpoints.documents.validation.keyHighlights(id)
      },
      {
        title: "Document Summary",
        type: "document-summary",
        contentUrl: endpoints.documents.validation.summary(id)
      }
    ]
  };

  // Create all entries in parallel
  const [processedDocResponse] = await Promise.all([
    axiosInstance.post(endpoints.documents.validation.base, newProcessedDoc),
    
    // Create file preview data with comprehensive mock content
    axiosInstance.post(endpoints.documents.validation.filePreview(numberId), {
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
    axiosInstance.post(endpoints.documents.validation.keyHighlights(id), {
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
    axiosInstance.post(endpoints.documents.validation.summary(id), {
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
    axiosInstance.post(endpoints.documents.validation.actors(id), {
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
    axiosInstance.post(endpoints.documents.validation.actions(id), {
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
    axiosInstance.post(endpoints.documents.validation.tables(id), {
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

export function useGetActivityStatus(activityId: number | null) {
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

          // Create new child products/components in the unified products table
          const newChildProducts: ProductNode[] = filePreview.data.map((item: any) => ({
            id: parseInt(uuidv4().replace(/-/g, '').substring(0, 8), 16), // Generate numeric ID
            name: item.material,
            quantity: item.qty,
            organizationId: productToUpdate.organizationId,
            parentId: productToUpdate.id, // Set parent relationship
            type: 'raw_material' as const,
            description: `Sourced from ${item.supplier}`,
            unit: item.unit,
            sku: null,
            category: null,
            supplierOrganizationId: null,
            metadata: {
              originCountry: item.origin,
              certifications: [item.cert],
            },
            dataCompleteness: 75,
            missingDataFields: ['carbon_footprint'],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            children: [],
          }));

          // In a real app, these would be created via API calls to the products endpoint
          // For now, we'll update the product's children array for display purposes
          const updatedProduct = {
            ...productToUpdate,
            children: [...(productToUpdate.children || []), ...newChildProducts],
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
  }, [data, mutate, updateProduct]);

  return {
    activity: data,
    isLoading,
    isError: error,
  };
}

export function useGetDocument(id: string) {
  const { data, error, isLoading } = useSWR<ProcessedDocument>(
    id ? `${endpoints.documents.base}/${id}` : null,
    fetcher,
  );

  return {
    document: data,
    isLoading,
    isError: error,
  };
}

export function useGetFilePreview(documentId: number | undefined) {
  const { data, error, isLoading } = useSWR<FilePreviewData>(
    documentId ? endpoints.documents.validation.filePreview(documentId) : null, 
    fetcher
  );

  return {
    filePreview: data,
    isLoading,
    isError: error,
  };
}

export function useGetKeyHighlights(documentId: string | undefined) {
  const { data, error, isLoading } = useSWR<KeyHighlightsData>(
    documentId ? endpoints.documents.validation.keyHighlights(documentId) : null, 
    fetcher
  );

  return {
    keyHighlights: data,
    isLoading,
    isError: error,
  };
}

export function useGetDocumentSummary(documentId: string | undefined) {
  const { data, error, isLoading } = useSWR<DocumentSummaryData>(
    documentId ? endpoints.documents.validation.summary(documentId) : null,
    fetcher
  );

  return {
    documentSummary: data,
    isLoading,
    isError: error,
  };
}

export function useGetActors(documentId: string | undefined) {
  const { data, error, isLoading } = useSWR<Actor[]>(
    documentId ? endpoints.documents.validation.actors(documentId) : null,
    async (url: string) => {
      try {
        const response = await fetcher(url);
        
        if (Array.isArray(response) && response.length > 0) {
          return response;
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
    documentId ? endpoints.documents.validation.tables(documentId) : null,
    async (url: string): Promise<DynamicTable> => {
      try {
        const response = await fetcher(url);
        
        console.log('Document Tables API Response:', response); // Debug log
        
        // Check if table data exists and is properly structured
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log('Found valid table data:', response.data); // Debug log
          
          const tableData: DynamicTable = {
            title: response.title || 'Document Data Table',
            columns: response.columns || Object.keys(response.data[0]).filter(key => key !== 'id'),
            data: response.data
          };
          
          console.log('Generated table data:', tableData); // Debug log
          return tableData;
        }
        
        // If no valid data found, return fallback structure
        console.warn('No valid table data found:', response); // Debug log
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
    documentId ? endpoints.documents.validation.actions(documentId) : null,
    async (url: string) => {
      try {
        const response = await fetcher(url);
        
        if (Array.isArray(response) && response.length > 0) {
          return response;
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