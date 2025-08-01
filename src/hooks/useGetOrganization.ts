import { api } from "@/src/utils/api";

export function useGetOrganization(organizationId: string) {
  return api.organization.getOrganizationById.useQuery(
    { id: organizationId },
    { enabled: !!organizationId }
  );
}
