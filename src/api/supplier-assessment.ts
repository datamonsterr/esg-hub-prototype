'use client';

// Re-export supplier assessment related functions from assessment.ts
export {
  useGetAssessments,
  useSearchAssessments,
  useGetAssessment,
  useGetTemplate,
  useCreateAssessment,
  useSupplierAssessmentPage,
  getAssessments,
  getAssessmentById,
  getTemplateById,
  getSupplierAssessmentPage,
  createAssessment,
} from './assessment'; 