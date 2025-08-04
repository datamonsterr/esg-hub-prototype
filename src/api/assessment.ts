'use client';

import { api } from '@/src/utils/api';
import { Assessment } from '../types/assessment';

// #region tRPC Hooks
export function useGetAssessments() {
  const {
    data: assessments,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.assessment.getAssessments.useQuery();

  return {
    assessments,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetAssessment(id: string) {
  const {
    data: assessment,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.assessment.getAssessmentById.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    assessment,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetAssessmentById(id: string) {
  const {
    data: assessment,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.assessment.getAssessmentById.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    assessment,
    isLoading,
    isError,
    mutate,
  };
}

export function useCreateAssessment() {
  const createAssessmentMutation = api.assessment.createAssessment.useMutation();

  return {
    createAssessment: createAssessmentMutation.mutateAsync,
    isLoading: createAssessmentMutation.isPending,
    isError: createAssessmentMutation.error,
    isCreating: createAssessmentMutation.isPending,
  };
}

export function useUpdateAssessment() {
  const updateAssessmentMutation = api.assessment.updateAssessment.useMutation();

  const updateAssessment = async (id: string, data: Partial<Assessment>) => {
    return await updateAssessmentMutation.mutateAsync({ id, data });
  };

  return {
    updateAssessment,
    isLoading: updateAssessmentMutation.isPending,
    isError: updateAssessmentMutation.error,
  };
}

export function useDeleteAssessment() {
  const deleteAssessmentMutation = api.assessment.deleteAssessment.useMutation();

  return {
    deleteAssessment: deleteAssessmentMutation.mutateAsync,
    isLoading: deleteAssessmentMutation.isPending,
    isError: deleteAssessmentMutation.error,
  };
}

export function useSearchAssessments(params?: {
  query?: string;
  status?: string;
  priority?: string;
}) {
  const {
    data: result,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.assessment.searchAssessments.useQuery(params);

  return {
    assessments: result?.assessments,
    totalPages: result?.totalPages || 0,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetTemplates() {
  const {
    data: templates,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.assessment.getTemplates.useQuery();

  return {
    templates,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetTemplate(id: string) {
  const {
    data: template,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.assessment.getTemplateById.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    template,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetTemplateById(id: string) {
  const {
    data: template,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.assessment.getTemplateById.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    template,
    isLoading,
    isError,
    mutate,
  };
}

export function useCreateTemplate() {
  const createTemplateMutation = api.assessment.createTemplate.useMutation();

  return {
    createTemplate: createTemplateMutation.mutateAsync,
    isLoading: createTemplateMutation.isPending,
    isError: createTemplateMutation.error,
  };
}

// #endregion
