'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosInstance, { apiEndpoints } from './axios';
import {
  DataIntegrationsData,
  Activity,
  ProcessedDocument,
  FilePreviewData,
  KeyHighlightsData,
  FileUploadData,
  DocumentSummaryData,
  Actor,
  DynamicTable,
} from '../types/data-integration';
import { useEffect } from 'react';
import { toast } from 'sonner';

// #region RAW API
export const getDataIntegrations = async () => {
  const res = await axiosInstance.get(apiEndpoints.integrations.base);
  return res.data;
};

export const getFileUpload = async () => {
  const res = await axiosInstance.get(apiEndpoints.integrations.fileUpload);
  return res.data;
};

export const getActivities = async (limit?: number) => {
  const res = await axiosInstance.get(apiEndpoints.integrations.activities);
  const activities = res.data
    ? [...res.data]
        .sort(
          (a: Activity, b: Activity) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, limit)
    : [];
  return activities;
};

export const getActivityById = async (id: string) => {
  const res = await axiosInstance.get(
    `${apiEndpoints.integrations.activities}/${id}`,
  );
  return res.data;
};

export const createActivity = async (
  url: string,
  { arg }: { arg: { id: string; title: string; subtitle: string } },
) => {
  const newActivity: Activity = {
    ...arg,
    status: 'processing',
    createdAt: new Date().toISOString(),
  };
  const response = await axiosInstance.post(
    apiEndpoints.integrations.activities,
    newActivity,
  );
  return response.data;
};

export const getDocumentById = async (id: string) => {
  const res = await axiosInstance.get(apiEndpoints.documents.processed + `/${id}`);
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
    axiosInstance.post(apiEndpoints.documents.processed, newProcessedDoc),
    
    // Create file preview data with comprehensive mock content
    axiosInstance.post(apiEndpoints.documents.previews, {
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
    axiosInstance.post(apiEndpoints.dataValidation.keyHighlights, {
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
    axiosInstance.post(apiEndpoints.documents.summary, {
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
    axiosInstance.post(apiEndpoints.documents.actors, {
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
    axiosInstance.post(apiEndpoints.documents.actions, {
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
    axiosInstance.post(apiEndpoints.documents.tables, {
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

export function useDataIntegrations() {
  const { data, error, isLoading } = useSWR<DataIntegrationsData>(
    apiEndpoints.integrations.base,
    fetcher,
  );

  return {
    dataIntegrations: data,
    isLoading,
    isError: error,
  };
}

export function useFileUpload() {
  const { data, error, isLoading } = useSWR<FileUploadData>(
    apiEndpoints.integrations.fileUpload,
    fetcher,
  );

  return {
    fileUpload: data,
    isLoading,
    isError: error,
  };
}

export function useGetActivities(limit?: number) {
  const { data, error, isLoading } = useSWR<Activity[]>(
    apiEndpoints.integrations.activities,
    () => getActivities(limit),
  );

  return {
    activities: data,
    isLoading,
    isError: error,
  };
}

export function useCreateActivity() {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.integrations.activities,
    createActivity,
  );

  return {
    createActivity: trigger,
    isCreating: isMutating,
  };
}

export function useCreateDocument() {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.documents.processed,
    createDocument,
  );

  return {
    createDocument: trigger,
    isCreating: isMutating,
  };
}

export function useGetActivityStatus(activityId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Activity>(
    activityId ? `${apiEndpoints.integrations.activities}/${activityId}` : null,
    fetcher,
    {
      refreshInterval: (latestData) => {
        if (latestData?.status === 'processing') return 2000;
        return 0;
      },
    },
  );

  useEffect(() => {
    if (data?.status === 'processing') {
      // This logic should be on the backend, but we simulate it here for now.
      const processDocument = async () => {
        try {
          // Simulate processing time
          await new Promise((resolve) => setTimeout(resolve, 5000));
          
          // Update the existing document entries with processed data
          await Promise.all([
            // Update file preview with processed data
            axiosInstance.patch(`${apiEndpoints.documents.previews}/${data.id}`, {
              fileSize: "1.2 MB",
              data: [
                {
                  material: "Organic Cotton",
                  origin: "India - Gujarat",
                  supplier: "GreenTech Materials Ltd",
                  cert: "GOTS Certified",
                  date: new Date().toISOString().split('T')[0],
                  qty: 2500,
                  unit: "kg",
                  status: "verified"
                },
                {
                  material: "Recycled Polyester",
                  origin: "Japan - Osaka",
                  supplier: "EcoFiber Corp",
                  cert: "GRS Certified",
                  date: new Date().toISOString().split('T')[0],
                  qty: 1800,
                  unit: "kg",
                  status: "verified"
                },
                {
                  material: "Natural Dyes",
                  origin: "Peru - Lima",
                  supplier: "Natural Colors Ltd",
                  cert: "OEKO-TEX",
                  date: new Date().toISOString().split('T')[0],
                  qty: 50,
                  unit: "L",
                  status: "verified"
                }
              ]
            }),

            // Update key highlights with processed results
            axiosInstance.patch(`${apiEndpoints.dataValidation.keyHighlights}/${data.id}`, {
              highlights: [
                {
                  title: "Document successfully processed and validated",
                  percentage: 100,
                  status: "success",
                  suggestion: "Review",
                  detail: "All data extracted and validated successfully"
                },
                {
                  title: "Data integrity checks completed",
                  percentage: 95,
                  status: "info",
                  suggestion: "Monitor",
                  detail: "Minor formatting inconsistencies detected"
                },
                {
                  title: "Integration readiness assessment",
                  percentage: 87,
                  status: "warning",
                  suggestion: "Optimize",
                  detail: "Some fields may need manual review"
                }
              ]
            }),

            // Update document summary with processed results
            axiosInstance.patch(`${apiEndpoints.documents.summary}/${data.id}`, {
              description: `Successfully processed ESG compliance report with comprehensive data extraction and validation. Document contains verified supply chain traceability data from 3 certified suppliers across multiple regions with complete material sourcing information and certification details.`,
              reportingPeriod: "2024 Q1",
              organizationCount: 3,
              keyMetrics: [
                {
                  name: "Material Traceability",
                  value: "98",
                  unit: "%",
                  category: "compliance"
                },
                {
                  name: "Supplier Certifications",
                  value: "3",
                  unit: "verified",
                  category: "certification"
                },
                {
                  name: "Carbon Footprint",
                  value: "2.1",
                  unit: "tCO2e",
                  category: "environmental"
                },
                {
                  name: "Data Completeness",
                  value: "95",
                  unit: "%",
                  category: "quality"
                },
                {
                  name: "Processing Time",
                  value: "5.2",
                  unit: "seconds",
                  category: "performance"
                }
              ],
              dataQuality: {
                completeness: 95,
                accuracy: 92,
                consistency: 88
              }
            }),

            // Update document actors with processed results
            axiosInstance.patch(`${apiEndpoints.documents.actors}/${data.id}`, {
              actors: [
                {
                  id: 1,
                  title: "Primary Supplier",
                  description: "GreenTech Materials Ltd - Verified",
                  color: "bg-blue-50 text-blue-900",
                  dotColor: "bg-blue-500"
                },
                {
                  id: 2,
                  title: "Brand Owner",
                  description: "EcoSustain Corp - Validated",
                  color: "bg-green-50 text-green-900",
                  dotColor: "bg-green-500"
                },
                {
                  id: 3,
                  title: "Auditor",
                  description: "ESG Certification Body - Approved",
                  color: "bg-purple-50 text-purple-900",
                  dotColor: "bg-purple-500"
                },
                {
                  id: 4,
                  title: "Logistics Provider",
                  description: "Sustainable Transport Co - Confirmed",
                  color: "bg-yellow-50 text-yellow-900",
                  dotColor: "bg-yellow-500"
                }
              ]
            }),

            // Update document actions with processed results
            axiosInstance.patch(`${apiEndpoints.documents.actions}/${data.id}`, {
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

            // Update document table with processed results
            axiosInstance.patch(`${apiEndpoints.documents.tables}/${data.id}`, {
              title: `${data.subtitle} - Supply Chain Analysis (Processed)`,
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
                  "Sustainability Score": "9.4",
                  Status: "Verified"
                },
                {
                  id: "row-2",
                  Material: "Recycled Polyester",
                  Supplier: "EcoFiber Corp",
                  Origin: "Japan - Osaka",
                  Certification: "GRS Certified",
                  Quantity: "1800",
                  Unit: "kg",
                  "Sustainability Score": "8.9",
                  Status: "Verified"
                },
                {
                  id: "row-3",
                  Material: "Natural Dyes",
                  Supplier: "Natural Colors Ltd",
                  Origin: "Peru - Lima",
                  Certification: "OEKO-TEX",
                  Quantity: "50",
                  Unit: "L",
                  "Sustainability Score": "9.5",
                  Status: "Verified"
                },
                {
                  id: "row-4",
                  Material: "Bamboo Fiber",
                  Supplier: "Sustainable Bamboo Co",
                  Origin: "Vietnam - Mekong Delta",
                  Certification: "FSC Certified",
                  Quantity: "800",
                  Unit: "kg",
                  "Sustainability Score": "9.1",
                  Status: "Verified"
                }
              ]
            })
          ]);

          await axiosInstance.patch(
            `${apiEndpoints.integrations.activities}/${data.id}`,
            { status: 'success' },
          );
          mutate();
        } catch (e) {
          console.error('Failed to simulate document processing', e);
          if (data?.id) {
            await axiosInstance.patch(
              `${apiEndpoints.integrations.activities}/${data.id}`,
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
    id ? apiEndpoints.documents.processed + `/${id}` : null,
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
      const response = await fetcher(`${apiEndpoints.documents.summary}/${id}`);
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
    documentId ? `${apiEndpoints.documents.processed}/${documentId}` : null,
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
    documentId ? `${apiEndpoints.documents.previews}/${documentId}` : null,
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
    documentId ? `${apiEndpoints.documents.actions}/${documentId}` : null,
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
// #endregion 