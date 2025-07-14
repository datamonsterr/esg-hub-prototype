import useSWR from 'swr';
import axiosInstance, { apiEndpoints } from './axios';
import { Assessment, AssessmentTemplate, SupplierAssessmentPageData } from '../types/supplier-assessment';
import { v4 as uuidv4 } from 'uuid';

const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

export function useSupplierAssessments() {
  const { data, error, isLoading } = useSWR<Assessment[]>(apiEndpoints.supplierAssessments, fetcher);

  return {
    assessments: data,
    isLoading,
    isError: error,
  };
}

export function useGetAssessment(id: string) {
  const { data, error, isLoading } = useSWR<Assessment>(
    id ? `${apiEndpoints.supplierAssessments}/${id}` : null,
    fetcher
  );

  return {
    assessment: data,
    isLoading,
    isError: error,
  };
}

export function useGetTemplate(id: string) {
  const { data, error, isLoading } = useSWR<AssessmentTemplate>(
    id ? `${apiEndpoints.assessmentTemplates}/${id}` : null,
    fetcher
  );

  return {
    template: data,
    isLoading,
    isError: error,
  };
}

export async function useCreateAssessment(data: AssessmentTemplate) {
  try {
    const newAssessment = {
      ...data,
      id: uuidv4(),
      creator: 'Current User', // Replace with actual user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Draft',
      // temp
      topic: 'TBD',
      tags: [],
      icon: 'fa-file-alt',
      topicColor: 'gray',
    };
    const response = await axiosInstance.post(apiEndpoints.supplierAssessments, newAssessment);
    return response.data;
  } catch (error) {
    console.error('Failed to create assessment', error);
    throw error;
  }
}

export function useSupplierAssessmentPage() {
    const { data, error, isLoading } = useSWR<SupplierAssessmentPageData>(apiEndpoints.supplierAssessmentPage, fetcher);
  
    return {
      pageData: data,
      isLoading,
      isError: error,
    };
  } 