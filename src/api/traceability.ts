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
  const res = await axiosInstance.get(endpoints.traceability.requests.incoming, { params });
  return res.data;
};

export const getOutgoingRequests = async (params?: {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<TraceabilityRequest[]> => {
  const res = await axiosInstance.get(endpoints.traceability.requests.outgoing, { params });
  return res.data;
};

export const getTraceabilityRequest = async (id: string): Promise<TraceabilityRequestDetail> => {
  const res = await axiosInstance.get(endpoints.traceability.requests.id(id));
  return res.data;
};

export const createTraceabilityRequest = async (data: CreateTraceabilityRequest): Promise<TraceabilityRequest> => {
  const res = await axiosInstance.post(endpoints.traceability.requests.base, data);
  return res.data;
};

export const updateTraceabilityRequest = async (id: string, data: Partial<TraceabilityRequest>): Promise<TraceabilityRequest> => {
  const res = await axiosInstance.put(endpoints.traceability.requests.id(id), data);
  return res.data;
};

export const respondToRequest = async (id: string, response: TraceabilityResponse): Promise<TraceabilityRequest> => {
  const res = await axiosInstance.post(endpoints.traceability.requests.respond(id), response);
  return res.data;
};

export const getTraceabilityAnalytics = async (): Promise<TraceabilityAnalytics> => {
  // Mock data for now
  return Promise.resolve({
    keyInsights: 'Tariff risks from Vietnam have increased by 15% in the last quarter, primarily affecting footwear production. Material traceability for leather remains low at 45%, posing a compliance risk.',
    tariffRiskByCountry: [
      { country: 'Vietnam', risk: 75, riskLevel: 'High', originPercentage: 35, material: 'Leather', status: 'At Risk' },
      { country: 'China', risk: 60, riskLevel: 'Medium', originPercentage: 25, material: 'Synthetics', status: 'Monitoring' },
      { country: 'Indonesia', risk: 45, riskLevel: 'Medium', originPercentage: 20, material: 'Rubber', status: 'Monitoring' },
      { country: 'Brazil', risk: 30, riskLevel: 'Low', originPercentage: 15, material: 'Cotton', status: 'Compliant' },
      { country: 'India', risk: 25, riskLevel: 'Low', originPercentage: 5, material: 'Cotton', status: 'Compliant' },
    ],
    materialTraceability: [
      { material: 'Leather', percentage: 45 },
      { material: 'Rubber', percentage: 80 },
      { material: 'Cotton', percentage: 70 },
      { material: 'Synthetics', percentage: 90 },
    ],
    complianceScore: 82,
    supplyChainVisibility: 65,
    originTraceabilityTrends: [
      { period: 'Q1 2024', percentage: 75 },
      { period: 'Q2 2024', percentage: 80 },
      { period: 'Q3 2024', percentage: 85 },
      { period: 'Q4 2024', percentage: 82 },
    ],
    overallStats: {
      traceabilityPercentage: 82,
      tracedCount: 245,
      untracedCount: 55,
    },
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
    [endpoints.traceability.requests.incoming, params],
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
    [endpoints.traceability.requests.outgoing, params],
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
    id ? endpoints.traceability.requests.id(id) : null,
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
    endpoints.traceability.analytics,
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