'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosInstance, { endpoints } from './axios';
import {
  Assessment,
  AssessmentTemplate,
  SupplierAssessmentPageData,
} from '../types/assessment';
import { v4 as uuidv4 } from 'uuid';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

// #region RAW API
export const getAssessments = async () => {
  const res = await axiosInstance.get(endpoints.assessments.base);
  return res.data;
};

export const getAssessmentById = async (id: string) => {
  const res = await axiosInstance.get(endpoints.assessments.id(id));
  return res.data;
};

export const getTemplateById = async (id: string) => {
  const res = await axiosInstance.get(endpoints.assessmentTemplates.id(id));
  return res.data;
};

export const createAssessment = async (
  url: string,
  { arg }: { arg: AssessmentTemplate },
) => {
  const newAssessment = {
    ...arg,
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
  const response = await axiosInstance.post(
    endpoints.assessments.base,
    newAssessment,
  );
  return response.data;
};

export const getAssessmentFilters = async () => {
  const res = await axiosInstance.get(endpoints.assessmentFilters);
  return res.data;
};

// #endregion

// #region SWR
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

export function useGetAssessments() {
  const { data, error, isLoading } = useSWR<Assessment[]>(
    endpoints.assessments.base,
    fetcher,
  );

  return {
    assessments: data,
    isLoading,
    isError: error,
  };
}

export function useSearchAssessments() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title');
  const pageStr = searchParams.get('page');
  const limitStr = searchParams.get('limit');

  const page = pageStr && /^\d+$/.test(pageStr) ? parseInt(pageStr, 10) : 1;
  const limit =
    limitStr && /^\d+$/.test(limitStr) ? parseInt(limitStr, 10) : 9;

  const {
    data: allAssessments,
    error,
    isLoading,
  } = useSWR<Assessment[]>(endpoints.assessments.base, fetcher);

  const searchResult = useMemo(() => {
    if (!allAssessments) {
      return {
        assessments: [],
        totalAssessments: 0,
        totalPages: 0,
      };
    }

    const filtered = allAssessments.filter((assessment) =>
      title
        ? assessment.title.toLowerCase().includes(title.toLowerCase())
        : true,
    );

    const totalAssessments = filtered.length;
    const totalPages = Math.ceil(totalAssessments / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      assessments: paginated,
      totalAssessments,
      totalPages,
    };
  }, [allAssessments, title, page, limit]);

  return {
    ...searchResult,
    isLoading,
    isError: error,
  };
}

export function useGetAssessment(id: string) {
  const { data, error, isLoading } = useSWR<Assessment>(
    id ? endpoints.assessments.id(id) : null,
    fetcher,
  );

  return {
    assessment: data,
    isLoading,
    isError: error,
  };
}

export function useGetTemplate(id: string) {
  const { data, error, isLoading } = useSWR<AssessmentTemplate>(
    id ? endpoints.assessmentTemplates.id(id) : null,
    fetcher,
  );

  return {
    template: data,
    isLoading,
    isError: error,
  };
}

export function useCreateAssessment(data: Assessment) {
  const { trigger, isMutating } = useSWRMutation(
    endpoints.assessments.base,
    createAssessment,
  );

  return {
    createAssessment: trigger,
    isCreating: isMutating,
  };
}

export function useAssessmentFilters() {
  const { data, error, isLoading } = useSWR<{ topics: string[]; creators: string[] }>(
    endpoints.assessmentFilters,
    fetcher
  );
  return {
    filters: data,
    isLoading,
    isError: error,
  };
}
