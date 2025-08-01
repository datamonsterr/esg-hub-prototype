'use client';

import { api } from '../utils/api';

// #region tRPC API
export function useGetProcessedDocument(id: string | null) {
  return api.document.getProcessedDocument.useQuery(
    { id: id! },
    {
      enabled: !!id,
    }
  );
}
// #endregion 