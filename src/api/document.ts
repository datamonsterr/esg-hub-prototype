'use client';

import useSWR from 'swr';
import axiosInstance, { apiEndpoints } from './axios';
import { ProcessedDocument } from '../types/processed-document';

// #region RAW API
export const getProcessedDocumentById = async (
  id: string,
): Promise<ProcessedDocument> => {
  const res = await axiosInstance.get(
    `${apiEndpoints.documents.processed}/${id}`,
  );
  return res.data;
};
// #endregion

// #region SWR
export function useGetProcessedDocument(id: string | null) {
  const { data, error, isLoading } = useSWR<ProcessedDocument>(
    id ? `${apiEndpoints.documents.processed}/${id}` : null,
    () => getProcessedDocumentById(id as string),
  );

  return {
    document: data,
    isLoading,
    isError: error,
  };
}
// #endregion 