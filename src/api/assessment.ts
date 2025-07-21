"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { v4 as uuidv4 } from "uuid";
import { Assessment, AssessmentTemplate } from "../types/assessment";
import axiosInstance, { endpoints } from "./axios";

// #region RAW API
export const getAssessments = async () => {
  const res = await axiosInstance.get(endpoints.assessment.base);
  return res.data;
};

export const getAssessmentById = async (id: string) => {
  const res = await axiosInstance.get(endpoints.assessment.id(id));
  return res.data;
};

export const getTemplateById = async (id: string) => {
  const res = await axiosInstance.get(endpoints.assessment.template.id(id));
  return res.data;
};

export const createAssessment = async (
  url: string,
  { arg }: { arg: AssessmentTemplate }
) => {
  const newAssessment = {
    ...arg,
    id: uuidv4(),
    creator: "Current User", // Replace with actual user
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "Draft",
    // temp
    topic: "TBD",
    tags: [],
    icon: "fa-file-alt",
    topicColor: "gray",
  };
  const response = await axiosInstance.post(
    endpoints.assessment.base,
    newAssessment
  );
  return response.data;
};

export const getAssessmentFilters = async () => {
  const res = await axiosInstance.get(endpoints.assessment.filter);
  return res.data;
};

// #endregion

// #region SWR
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

export function useGetAssessments() {
  const { data, error, isLoading } = useSWR<Assessment[]>(
    endpoints.assessment.base,
    fetcher
  );

  return {
    assessments: data,
    isLoading,
    isError: error,
  };
}

export function useSearchAssessments() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const pageStr = searchParams.get("page");
  const limitStr = searchParams.get("limit");

  const page = pageStr && /^\d+$/.test(pageStr) ? parseInt(pageStr, 10) : 1;
  const limit = limitStr && /^\d+$/.test(limitStr) ? parseInt(limitStr, 10) : 9;

  const {
    data: allAssessments,
    error,
    isLoading,
  } = useSWR<Assessment[]>(endpoints.assessment.base, fetcher);

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
        : true
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
    id ? endpoints.assessment.id(id) : null,
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
    id ? endpoints.assessment.template.id(id) : null,
    fetcher
  );

  return {
    template: data,
    isLoading,
    isError: error,
  };
}

export function useCreateAssessment(data: Assessment) {
  const { trigger, isMutating } = useSWRMutation(
    endpoints.assessment.base,
    createAssessment
  );

  return {
    createAssessment: trigger,
    isCreating: isMutating,
  };
}

export function useAssessmentFilters() {
  const { data, error, isLoading } = useSWR<{
    topics: string[];
    creators: string[];
  }>(endpoints.assessment.filter, fetcher);
  return {
    filters: data,
    isLoading,
    isError: error,
  };
}
