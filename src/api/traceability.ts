'use client';

import useSWR from 'swr';
import axiosInstance, { endpoints } from './axios';
import {
  TraceabilityRequest,
  TraceabilityRequestDetail,
  CreateTraceabilityRequest,
  TraceabilityResponse,
  TraceabilityAnalytics
} from '@/src/types';

// #region RAW API
export const getIncomingRequests = async (params?: {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<TraceabilityRequest[]> => {
  const res = await axiosInstance.get(endpoints.traceabilityRequests.incoming, { params });
  return res.data;
};

export const getOutgoingRequests = async (params?: {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<TraceabilityRequest[]> => {
  const res = await axiosInstance.get(endpoints.traceabilityRequests.outgoing, { params });
  return res.data;
};

export const getTraceabilityRequest = async (id: string): Promise<TraceabilityRequestDetail> => {
  const res = await axiosInstance.get(endpoints.traceabilityRequests.id(id));
  return res.data;
};

export const createTraceabilityRequest = async (data: CreateTraceabilityRequest): Promise<TraceabilityRequest> => {
  const res = await axiosInstance.post(endpoints.traceabilityRequests.base, data);
  return res.data;
};

export const updateTraceabilityRequest = async (id: string, data: Partial<TraceabilityRequest>): Promise<TraceabilityRequest> => {
  const res = await axiosInstance.put(endpoints.traceabilityRequests.id(id), data);
  return res.data;
};

export const respondToRequest = async (id: string, response: TraceabilityResponse): Promise<TraceabilityRequest> => {
  const res = await axiosInstance.post(endpoints.traceabilityRequests.respond(id), response);
  return res.data;
};

export const getTraceabilityAnalytics = async (): Promise<TraceabilityAnalytics> => {
  // Mock data for now
  return Promise.resolve({
    keyInsights: 'Tariff risks from Vietnam have increased by 15% in the last quarter, primarily affecting footwear production. Material traceability for leather remains low at 45%, posing a compliance risk.',
    tariffRiskByCountry: [
      { country: 'Vietnam', risk: 75 },
      { country: 'China', risk: 60 },
      { country: 'Indonesia', risk: 45 },
      { country: 'Brazil', risk: 30 },
      { country: 'India', risk: 25 },
    ],
    materialTraceability: [
      { material: 'Leather', percentage: 45 },
      { material: 'Rubber', percentage: 80 },
      { material: 'Cotton', percentage: 70 },
      { material: 'Synthetics', percentage: 90 },
    ],
    complianceScore: 82,
    supplyChainVisibility: 65,
  });
};

// #endregion

// #region SWR
export function useGetIncomingRequests(params?: {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { data, error, isLoading, mutate } = useSWR<TraceabilityRequest[]>(
    [endpoints.traceabilityRequests.incoming, params],
    () => getIncomingRequests(params),
  );

  return {
    incomingRequests: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useGetOutgoingRequests(params?: {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { data, error, isLoading, mutate } = useSWR<TraceabilityRequest[]>(
    ['/traceability-requests/outgoing', params],
    () => getOutgoingRequests(params),
  );

  return {
    outgoingRequests: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useGetTraceabilityRequest(id: string) {
  const { data, error, isLoading, mutate } = useSWR<TraceabilityRequestDetail>(
    id ? endpoints.traceabilityRequests.id(id) : null,
    () => getTraceabilityRequest(id),
  );

  return {
    request: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCreateTraceabilityRequest() {
  const createRequest = async (data: CreateTraceabilityRequest) => {
    return await createTraceabilityRequest(data);
  };

  return { createTraceabilityRequest: createRequest };
}

export function useUpdateTraceabilityRequest() {
  const updateRequest = async (id: string, data: Partial<TraceabilityRequest>) => {
    return await updateTraceabilityRequest(id, data);
  };

  return { updateTraceabilityRequest: updateRequest };
}

export function useRespondToRequest() {
  const respond = async (id: string, response: TraceabilityResponse) => {
    return await respondToRequest(id, response);
  };

  return { respondToRequest: respond };
}

export function useTraceabilityAnalytics() {
  const { data, error, isLoading, mutate } = useSWR<TraceabilityAnalytics>(
    '/traceability-requests/analytics',
    getTraceabilityAnalytics
  );

  return {
    analytics: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// #endregion 