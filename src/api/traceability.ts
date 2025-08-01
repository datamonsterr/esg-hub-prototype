'use client';

import { api } from '@/src/utils/api';
import type {
  TraceabilityRequest,
  TraceabilityRequestDetail,
  CreateTraceabilityRequest,
  TraceabilityResponse,
  TraceabilityAnalytics
} from '@/src/types';

// #region RAW API functions (now using tRPC)
export const getIncomingRequests = async (params?: {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<TraceabilityRequest[]> => {
  // This will be called by the tRPC hooks
  throw new Error('Use useGetIncomingRequests hook instead');
};

export const getOutgoingRequests = async (params?: {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<TraceabilityRequest[]> => {
  // This will be called by the tRPC hooks
  throw new Error('Use useGetOutgoingRequests hook instead');
};

export const getTraceabilityRequest = async (id: string): Promise<TraceabilityRequestDetail> => {
  // This will be called by the tRPC hooks
  throw new Error('Use useGetTraceabilityRequest hook instead');
};

export const createTraceabilityRequest = async (data: CreateTraceabilityRequest): Promise<TraceabilityRequest> => {
  // This will be called by the tRPC hooks
  throw new Error('Use useCreateTraceabilityRequest hook instead');
};

export const updateTraceabilityRequest = async (id: string, data: Partial<TraceabilityRequest>): Promise<TraceabilityRequest> => {
  // This will be called by the tRPC hooks
  throw new Error('Use useUpdateTraceabilityRequest hook instead');
};

export const respondToRequest = async (id: string, response: TraceabilityResponse): Promise<TraceabilityRequest> => {
  // This will be called by the tRPC hooks
  throw new Error('Use useRespondToRequest hook instead');
};

export const getTraceabilityAnalytics = async (): Promise<TraceabilityAnalytics> => {
  // This will be called by the tRPC hooks
  throw new Error('Use useTraceabilityAnalytics hook instead');
};

// #endregion

// #region tRPC Hooks
export function useGetIncomingRequests(params?: {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const {
    data: incomingRequests,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.traceability.getIncomingRequests.useQuery(params);

  return {
    incomingRequests,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetOutgoingRequests(params?: {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const {
    data: outgoingRequests,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.traceability.getOutgoingRequests.useQuery(params);

  return {
    outgoingRequests,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetTraceabilityRequest(id: string) {
  const {
    data: request,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.traceability.getTraceabilityRequest.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    request,
    isLoading,
    isError,
    mutate,
  };
}

export function useCreateTraceabilityRequest() {
  const createRequest = api.traceability.createTraceabilityRequest.useMutation();

  return {
    createTraceabilityRequest: createRequest.mutateAsync,
    isLoading: createRequest.isPending,
    isError: createRequest.error,
  };
}

export function useUpdateTraceabilityRequest() {
  const updateRequest = api.traceability.updateTraceabilityRequest.useMutation();

  const updateTraceabilityRequest = async (id: string, data: Partial<TraceabilityRequest>) => {
    return await updateRequest.mutateAsync({ id, data });
  };

  return {
    updateTraceabilityRequest,
    isLoading: updateRequest.isPending,
    isError: updateRequest.error,
  };
}

export function useRespondToRequest() {
  const respond = api.traceability.respondToRequest.useMutation();

  const respondToRequest = async (id: string, response: TraceabilityResponse) => {
    return await respond.mutateAsync({ id, response });
  };

  return {
    respondToRequest,
    isLoading: respond.isPending,
    isError: respond.error,
  };
}

export function useTraceabilityAnalytics() {
  const {
    data: analytics,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.traceability.getAnalytics.useQuery();

  return {
    analytics,
    isLoading,
    isError,
    mutate,
  };
}

// #endregion
