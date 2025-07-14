import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
});

export const apiEndpoints = {
  supplierAssessments: '/supplier-assessments',
  dataValidation: '/data-validation',
  dataIntegrations: '/data-integrations',
  fileUpload: '/file-upload',
  supplierAssessmentPage: '/supplier-assessment-page',
  assessmentTemplates: '/assessment-templates',
};

export default axiosInstance; 