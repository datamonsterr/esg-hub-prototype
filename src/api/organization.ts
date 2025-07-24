"use client";

import useSWR from "swr";
import axiosInstance from "./axios";
import { Organization } from "@/src/types/user";

// #region RAW API
export const getOrganizations = async (): Promise<Organization[]> => {
  const res = await axiosInstance.get("/organizations");
  return res.data;
};

export const getOrganizationById = async (
  id: string
): Promise<Organization> => {
  const res = await axiosInstance.get(`/organizations/${id}`);
  return res.data;
};

export const updateOrganization = async (
  id: string,
  data: Partial<Organization>
): Promise<Organization> => {
  const res = await axiosInstance.put(`/organizations/${id}`, data);
  return res.data;
};

export const leaveOrganization = async (
  organizationId: string
): Promise<void> => {
  await axiosInstance.post(`/organizations/${organizationId}/leave`);
};

// #endregion

// #region SWR
export function useGetOrganizations() {
  const { data, error, isLoading, mutate } = useSWR<Organization[]>(
    "/organizations",
    getOrganizations
  );

  return {
    organizations: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useGetOrganization(id: string) {
  const { data, error, isLoading } = useSWR<Organization>(
    id ? `/organizations/${id}` : null,
    () => getOrganizationById(id)
  );

  return {
    organization: data,
    isLoading,
    isError: error,
  };
}

export function useUpdateOrganization() {
  const updateOrg = async (id: string, data: Partial<Organization>) => {
    return await updateOrganization(id, data);
  };

  return { updateOrganization: updateOrg };
}

export function useLeaveOrganization() {
  const leaveOrg = async (organizationId: string) => {
    return await leaveOrganization(organizationId);
  };

  return { leaveOrganization: leaveOrg };
}

// #endregion
