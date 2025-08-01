'use client';

import { api } from '@/src/utils/api';
import { useEffect } from 'react';

// #endregion

// #region tRPC Hooks
export function useGetFileUpload() {
  const {
    data: fileUpload,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.integration.getFileUpload.useQuery();

  return {
    fileUpload,
    isLoading,
    isError,
  };
}

export function useGetActivityStatus(activityId: number | null) {
  const {
    data: activity,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.integration.getActivityById.useQuery(
    { id: activityId?.toString() || '' },
    { 
      enabled: !!activityId,
      refetchInterval: (query) => {
        if (query.state.data?.status === 'processing') return 2000;
        return false;
      },
    }
  );

  const { updateProduct } = useUpdateProduct();

  useEffect(() => {
    if (activity?.status === 'processing' && activity.productId) {
      const { productId } = activity;
      // This logic should be on the backend, but we simulate it here for now.
      const processDocument = async () => {
        try {
          // Simulate processing time
          await new Promise((resolve) => setTimeout(resolve, 5000));
          
          // In a real implementation, this would call the backend
          // For now, we'll just update the activity status
          await updateActivityStatus.mutateAsync({
            id: activity.id,
            status: 'success',
          });
          
          mutate();
        } catch (e) {
          console.error('Failed to simulate document processing', e);
          if (activity?.id) {
            await updateActivityStatus.mutateAsync({
              id: activity.id,
              status: 'failed',
            });
            mutate();
          }
        }
      };

      processDocument();
    }
  }, [activity, mutate]);

  const updateActivityStatus = api.integration.updateActivityStatus.useMutation();

  return {
    activity,
    isLoading,
    isError,
  };
}

export function useGetDocument(id: string) {
  const {
    data: document,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.integration.getDocumentById.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    document,
    isLoading,
    isError,
  };
}

export function useGetFilePreview(documentId: string | undefined) {
  const {
    data: filePreview,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.integration.getFilePreview.useQuery(
    { documentId: documentId || '' },
    { enabled: !!documentId }
  );

  return {
    filePreview,
    isLoading,
    isError,
  };
}

export function useGetDocumentSummary(documentId: string | undefined) {
  const {
    data: documentSummary,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.integration.getDocumentSummary.useQuery(
    { documentId: documentId || '' },
    { enabled: !!documentId }
  );

  return {
    documentSummary,
    isLoading,
    isError,
  };
}

export function useCreateDocument() {
  const createDocumentMutation = api.integration.createDocument.useMutation();

  return {
    createDocument: createDocumentMutation.mutateAsync,
    isLoading: createDocumentMutation.isPending,
    isError: createDocumentMutation.error,
  };
}

export function useUploadFile() {
  const uploadFileMutation = api.integration.uploadFile.useMutation();

  return {
    uploadFile: uploadFileMutation.mutateAsync,
    isLoading: uploadFileMutation.isPending,
    isError: uploadFileMutation.error,
  };
}

export function useCreateActivity() {
  const createActivityMutation = api.integration.createActivity.useMutation();

  return {
    createActivity: createActivityMutation.mutateAsync,
    isLoading: createActivityMutation.isPending,
    isError: createActivityMutation.error,
  };
}

export function useGetCsvImport() {
  const {
    data: csvImport,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.integration.getCsvImport.useQuery();

  return {
    csvImport,
    isLoading,
    isError,
  };
}

// Re-export from product API for backward compatibility
import { useUpdateProduct } from './product';

// #endregion
