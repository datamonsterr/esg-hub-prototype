'use client';

import useSWR from 'swr';
import axiosInstance, { endpoints } from './axios';
import { ProcessedDocument } from '../types/integration';

// #region RAW API
export const getProcessedDocumentById = async (
  id: string,
): Promise<ProcessedDocument> => {
  const res = await axiosInstance.get(
    `${endpoints.documents.base}/${id}`,
  );
  return res.data;
};
// #endregion

// #region SWR
export function useGetProcessedDocument(id: string | null) {
  const { data, error, isLoading } = useSWR<ProcessedDocument>(
    id ? `${endpoints.documents.base}/${id}` : null,
    () => getProcessedDocumentById(id as string),
  );

  return {
    document: data,
    isLoading,
    isError: error,
  };
}
// #endregion 