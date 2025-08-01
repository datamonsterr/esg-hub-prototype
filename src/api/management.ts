'use client';

import { api } from '../utils/api';
import { IntegrationActivityClient } from '../types/integration';

// #region tRPC API
export function useGetActivities(limit?: number) {
  return api.management.getActivities.useQuery({ limit });
}

export function useGetActivity(id: number | null) {
  return api.management.getActivity.useQuery(
    { id: id! },
    {
      enabled: !!id,
    }
  );
}

export function useCreateActivity() {
  return api.management.createActivity.useMutation();
}

export function useUpdateActivity() {
  return api.management.updateActivity.useMutation();
}

export function useDeleteActivity() {
  return api.management.deleteActivity.useMutation();
}
// #endregion 