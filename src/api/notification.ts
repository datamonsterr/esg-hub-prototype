'use client';

import { api } from '../utils/api';

// #region tRPC API
export function useGetNotifications() {
  return api.notification.getNotifications.useQuery();
}

export function useMarkAsRead() {
  return api.notification.markAsRead.useMutation();
}

export function useMarkAllAsRead() {
  return api.notification.markAllAsRead.useMutation();
}
// #endregion 