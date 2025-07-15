import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { 
  TraceabilityRequest, 
  TraceabilityRequestDetail, 
  CreateTraceabilityRequest, 
  TraceabilityAnalytics,
  AnalyticsQuery,
  Supplier,
  MaterialCode,
  ProductCode,
  ActionCode 
} from '../types/traceability';

const API_BASE = 'http://localhost:3001';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Create request mutation
async function createRequest(url: string, { arg }: { arg: CreateTraceabilityRequest }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create request');
  }
  
  return response.json();
}

// Update request mutation
async function updateRequest(url: string, { arg }: { arg: Partial<TraceabilityRequest> }) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update request');
  }
  
  return response.json();
}

// Delete request mutation
async function deleteRequest(url: string) {
  const response = await fetch(url, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete request');
  }
  
  return { success: true };
}

// Get all traceability requests
export function useTraceabilityRequests() {
  const { data, error, isLoading, mutate } = useSWR<TraceabilityRequest[]>(
    `${API_BASE}/traceability-requests`,
    fetcher
  );

  return {
    requests: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Get single traceability request with details
export function useTraceabilityRequest(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<TraceabilityRequestDetail>(
    id ? `${API_BASE}/traceability-requests-detail?id=${id}` : null,
    async (url: string) => {
      const data = await fetcher(url);
      // Since json-server returns an array, find the specific request
      return Array.isArray(data) ? data.find((req: TraceabilityRequestDetail) => req.id === id) : data;
    }
  );

  return {
    request: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Create new traceability request
export function useCreateTraceabilityRequest() {
  const { trigger, isMutating, error } = useSWRMutation(
    `${API_BASE}/traceability-requests`,
    createRequest
  );

  return {
    createRequest: trigger,
    isCreating: isMutating,
    error,
  };
}

// Update traceability request
export function useUpdateTraceabilityRequest(id: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `${API_BASE}/traceability-requests/${id}`,
    updateRequest
  );

  return {
    updateRequest: trigger,
    isUpdating: isMutating,
    error,
  };
}

// Delete traceability request
export function useDeleteTraceabilityRequest(id: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `${API_BASE}/traceability-requests/${id}`,
    deleteRequest
  );

  return {
    deleteRequest: trigger,
    isDeleting: isMutating,
    error,
  };
}

// Get traceability analytics
export function useTraceabilityAnalytics(query?: AnalyticsQuery) {
  const queryString = query ? `?${new URLSearchParams(query as any).toString()}` : '';
  
  const { data, error, isLoading, mutate } = useSWR<TraceabilityAnalytics>(
    `${API_BASE}/traceability-analytics${queryString}`,
    fetcher
  );

  return {
    analytics: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Get suppliers
export function useSuppliers() {
  const { data, error, isLoading } = useSWR<Supplier[]>(
    `${API_BASE}/suppliers`,
    fetcher
  );

  return {
    suppliers: data,
    isLoading,
    isError: error,
  };
}

// Get material codes
export function useMaterialCodes() {
  const { data, error, isLoading } = useSWR<MaterialCode[]>(
    `${API_BASE}/material-codes`,
    fetcher
  );

  return {
    materialCodes: data,
    isLoading,
    isError: error,
  };
}

// Get product codes
export function useProductCodes() {
  const { data, error, isLoading } = useSWR<ProductCode[]>(
    `${API_BASE}/product-codes`,
    fetcher
  );

  return {
    productCodes: data,
    isLoading,
    isError: error,
  };
}

// Get action codes
export function useActionCodes() {
  const { data, error, isLoading } = useSWR<ActionCode[]>(
    `${API_BASE}/action-codes`,
    fetcher
  );

  return {
    actionCodes: data,
    isLoading,
    isError: error,
  };
} 