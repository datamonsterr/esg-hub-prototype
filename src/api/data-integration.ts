import useSWR from 'swr';
import axiosInstance, { apiEndpoints } from './axios';
import { DataIntegrationsData } from '../types/data-integration';
import { FileUploadData } from '../types/file-upload';
import { DataValidationData } from '../types/data-validation';

const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

export function useDataIntegrations() {
  const { data, error, isLoading } = useSWR<DataIntegrationsData>(apiEndpoints.dataIntegrations, fetcher);

  return {
    dataIntegrations: data,
    isLoading,
    isError: error,
  };
}

export function useDataValidation() {
    const { data, error, isLoading } = useSWR<DataValidationData>(apiEndpoints.dataValidation, fetcher);
  
    return {
      dataValidation: data,
      isLoading,
      isError: error,
    };
}

export function useFileUpload() {
    const { data, error, isLoading } = useSWR<FileUploadData>(apiEndpoints.fileUpload, fetcher);
  
    return {
      fileUpload: data,
      isLoading,
      isError: error,
    };
} 