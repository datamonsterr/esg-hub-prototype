'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { Activity } from '../types/integration';
import axiosInstance, { endpoints } from './axios';

export const getActivities = async (limit?: number) => {
  const res = await axiosInstance.get(endpoints.integration.activities);
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
    endpoints.integration.activities,
    newActivity,
  );
  return response.data;
};

export function useGetActivities(limit?: number) {
  const { data, error, isLoading } = useSWR<Activity[]>(
    endpoints.integration.activities,
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
    endpoints.integration.activities,
    createActivity,
  );

  return {
    createActivity: trigger,
    isCreating: isMutating,
  };
} 