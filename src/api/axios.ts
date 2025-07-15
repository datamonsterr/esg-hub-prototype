import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
});

export const apiEndpoints = {
  assessments: {
    base: '/supplier-assessments',
    id: (id: string) => `/supplier-assessments/${id}`,
  },
  assessmentTemplates: {
    base: '/assessment-templates',
    id: (id: string) => `/assessment-templates/${id}`,
  },
  integrations: {
    base: '/data-integrations',
    activities: '/activities',
    fileUpload: '/file-upload',
  },
  dataValidation: {
    base: '/data-validation',
    keyHighlights: '/key-highlights-data',
  },
  documents: {
    processed: '/processed-documents',
    previews: '/file-previews',
    summary: '/document-summary',
    actors: '/document-actors',
    actions: '/document-actions',
    tables: '/document-tables',
  },
  notifications: '/notifications',
  supplierAssessmentPage: '/supplier-assessment-page',
};

export default axiosInstance; 