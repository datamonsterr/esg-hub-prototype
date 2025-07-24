import useSWR from "swr";
import axiosInstance from "@/src/api/axios";

export function useGetOrganization(organizationId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    organizationId ? `/organizations/${organizationId}` : null,
    (url: string) => axiosInstance.get(url).then((res) => res.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
