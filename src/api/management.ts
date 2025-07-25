'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { IntegrationActivity, IntegrationActivityClient } from '../types/integration';
import axiosInstance, { endpoints } from './axios';

// Helper function to convert snake_case to camelCase
const toCamelCase = (activity: IntegrationActivity): IntegrationActivityClient => ({
  id: activity.id,
  organizationId: activity.organization_id,
  title: activity.title,
  subtitle: activity.subtitle,
  status: activity.status,
  createdAt: activity.created_at,
});

// Helper function to convert camelCase to snake_case
const toSnakeCase = (activity: Partial<IntegrationActivityClient>): Partial<IntegrationActivity> => ({
  ...(activity.id !== undefined && { id: activity.id }),
  ...(activity.organizationId !== undefined && { organization_id: activity.organizationId }),
  ...(activity.title !== undefined && { title: activity.title }),
  ...(activity.subtitle !== undefined && { subtitle: activity.subtitle }),
  ...(activity.status !== undefined && { status: activity.status }),
  ...(activity.createdAt !== undefined && { created_at: activity.createdAt }),
});

export const getActivities = async (limit?: number): Promise<IntegrationActivityClient[]> => {
  const res = await axiosInstance.get(endpoints.integration.activities);
  const activities = res.data
    ? [...res.data]
        .map((activity: IntegrationActivity) => toCamelCase(activity))
        .sort(
          (a: IntegrationActivityClient, b: IntegrationActivityClient) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, limit)
    : [];
  return activities;
};

export const getActivity = async (id: number): Promise<IntegrationActivityClient> => {
  const res = await axiosInstance.get(`${endpoints.integration.activities}/${id}`);
  return toCamelCase(res.data);
};

export const createActivity = async (
  url: string,
  { arg }: { arg: { title: string; subtitle?: string; status?: string } },
): Promise<IntegrationActivityClient> => {
  const newActivity = {
    title: arg.title,
    subtitle: arg.subtitle || null,
    status: arg.status || 'processing',
  };
  
  const response = await axiosInstance.post(
    endpoints.integration.activities,
    newActivity,
  );
  return toCamelCase(response.data);
};

export const updateActivity = async (
  url: string,
  { arg }: { arg: { id: number; title?: string; subtitle?: string; status?: string } },
): Promise<IntegrationActivityClient> => {
  const { id, ...updateData } = arg;
  const response = await axiosInstance.put(
    `${endpoints.integration.activities}/${id}`,
    updateData,
  );
  return toCamelCase(response.data);
};

export const deleteActivity = async (
  url: string,
  { arg }: { arg: { id: number } },
): Promise<IntegrationActivityClient> => {
  const response = await axiosInstance.delete(
    `${endpoints.integration.activities}/${arg.id}`,
  );
  return toCamelCase(response.data);
};

export function useGetActivities(limit?: number) {
  const { data, error, isLoading } = useSWR<IntegrationActivityClient[]>(
    endpoints.integration.activities,
    () => getActivities(limit),
  );

  return {
    activities: data,
    isLoading,
    isError: error,
  };
}

export function useGetActivity(id: number | null) {
  const { data, error, isLoading } = useSWR<IntegrationActivityClient>(
    id ? `${endpoints.integration.activities}/${id}` : null,
    id ? () => getActivity(id) : null,
  );

  return {
    activity: data,
    isLoading,
    isError: error,
  };
}

export function useCreateActivity() {
  const { trigger, isMutating } = useSWRMutation(
    endpoints.integration.activities,
    createActivity,
  );

  return {
    createActivity: trigger,
    isCreating: isMutating,
  };
}

export function useUpdateActivity() {
  const { trigger, isMutating } = useSWRMutation(
    endpoints.integration.activities,
    updateActivity,
  );

  return {
    updateActivity: trigger,
    isUpdating: isMutating,
  };
}

export function useDeleteActivity() {
  const { trigger, isMutating } = useSWRMutation(
    endpoints.integration.activities,
    deleteActivity,
  );

  return {
    deleteActivity: trigger,
    isDeleting: isMutating,
  };
} 