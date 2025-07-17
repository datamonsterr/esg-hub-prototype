'use client';

import {
  AssessmentTemplate,
  CreateAssessmentTemplate
} from '@/src/types/assessment';
import useSWR from 'swr';
import axiosInstance, { endpoints } from './axios';

// #region RAW API
export const getAssessmentTemplates = async (params?: {
  organizationId?: string;
  category?: string;
  dataType?: string;
}): Promise<AssessmentTemplate[]> => {
  const res = await axiosInstance.get(endpoints.assessmentTemplates.base, { params });
  return res.data;
};

export const getAssessmentTemplateById = async (id: string): Promise<AssessmentTemplate> => {
  const res = await axiosInstance.get(endpoints.assessmentTemplates.id(id));
  return res.data;
};

export const createAssessmentTemplate = async (data: CreateAssessmentTemplate): Promise<AssessmentTemplate> => {
  const res = await axiosInstance.post(endpoints.assessmentTemplates.base, data);
  return res.data;
};

export const updateAssessmentTemplate = async (id: string, data: Partial<AssessmentTemplate>): Promise<AssessmentTemplate> => {
  const res = await axiosInstance.put(endpoints.assessmentTemplates.id(id), data);
  return res.data;
};

export const deleteAssessmentTemplate = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoints.assessmentTemplates.id(id));
};

// Get product data gaps for assessment targeting
export const getProductDataGaps = async (productId: string): Promise<{
  missingFields: string[];
  suggestedTemplates: AssessmentTemplate[];
}> => {
  const res = await axiosInstance.get(`/products/${productId}/data-gaps`);
  return res.data;
};

// Get component data gaps for assessment targeting
export const getComponentDataGaps = async (componentId: string): Promise<{
  missingFields: string[];
  suggestedTemplates: AssessmentTemplate[];
}> => {
  const res = await axiosInstance.get(`/components/${componentId}/data-gaps`);
  return res.data;
};

// #endregion

// #region SWR
export function useGetAssessmentTemplates(params?: {
  organizationId?: string;
  category?: string;
  dataType?: string;
}) {
  const { data, error, isLoading, mutate } = useSWR<AssessmentTemplate[]>(
    [endpoints.assessmentTemplates.base, params],
    () => getAssessmentTemplates(params),
  );

  return {
    templates: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useGetAssessmentTemplate(id: string) {
  const { data, error, isLoading } = useSWR<AssessmentTemplate>(
    id ? endpoints.assessmentTemplates.id(id) : null,
    () => getAssessmentTemplateById(id),
  );

  return {
    template: data,
    isLoading,
    isError: error,
  };
}

export function useCreateAssessmentTemplate() {
  const createTemplate = async (data: CreateAssessmentTemplate) => {
    return await createAssessmentTemplate(data);
  };

  return { createTemplate };
}

export function useUpdateAssessmentTemplate() {
  const updateTemplate = async (id: string, data: Partial<AssessmentTemplate>) => {
    return await updateAssessmentTemplate(id, data);
  };

  return { updateTemplate };
}

export function useDeleteAssessmentTemplate() {
  const deleteTemplate = async (id: string) => {
    return await deleteAssessmentTemplate(id);
  };

  return { deleteTemplate };
}

export function useGetProductDataGaps(productId: string) {
  const { data, error, isLoading } = useSWR(
    productId ? `/products/${productId}/data-gaps` : null,
    () => getProductDataGaps(productId),
  );

  return {
    dataGaps: data,
    isLoading,
    isError: error,
  };
}

export function useGetComponentDataGaps(componentId: string) {
  const { data, error, isLoading } = useSWR(
    componentId ? `/components/${componentId}/data-gaps` : null,
    () => getComponentDataGaps(componentId),
  );

  return {
    dataGaps: data,
    isLoading,
    isError: error,
  };
}

// #endregion

// Legacy exports for backward compatibility (to be removed after migration)
export const getAssessments = getAssessmentTemplates;
export const getAssessmentById = getAssessmentTemplateById;
export const getTemplateById = getAssessmentTemplateById;
export const createAssessment = createAssessmentTemplate;

export const useGetAssessments = useGetAssessmentTemplates;
export const useSearchAssessments = useGetAssessmentTemplates;
export const useGetAssessment = useGetAssessmentTemplate;
export const useGetTemplate = useGetAssessmentTemplate;
export const useCreateAssessment = useCreateAssessmentTemplate; 