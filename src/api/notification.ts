'use client';

import useSWR from 'swr';
import axiosInstance, { endpoints } from './axios';
import { Notification } from '../types/notification';

// #region RAW API
export const getNotifications = async (): Promise<Notification[]> => {
  const res = await axiosInstance.get(endpoints.notifications);
  return res.data;
};
// #endregion

// #region SWR
export function useGetNotifications() {
  const { data, error, isLoading } = useSWR<Notification[]>(
    endpoints.notifications,
    getNotifications,
  );

  return {
    notifications: data,
    isLoading,
    isError: error,
  };
}
// #endregion 