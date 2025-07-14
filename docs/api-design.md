# API Design

This document outlines the structure of the mock API for the ESG Hub Prototype. The API is powered by `json-server` and provides endpoints for various resources used in the application.

## Base URL

The mock server runs on `http://localhost:3001`.

## Endpoints

The API exposes the following endpoints:

### Supplier Assessment

- **GET** `/supplier-assessments`
  - **Description:** Retrieves a list of all supplier assessments.
  - **Response Body:** An array of `Assessment` objects.
  - **Type Definition:**
    ```typescript
    export interface Assessment {
      id: string;
      title: string;
      description: string;
      topic: string;
      creator: string;
      createdAt: string;
      updatedAt: string;
      status: 'Complete' | 'Draft' | 'In Progress';
      tags: string[];
      icon: string;
      topicColor: string;
    }
    ```

- **GET** `/supplier-assessment-page`
  - **Description:** Retrieves the data required for the supplier assessment page, including tabs, filters, and templates.
  - **Response Body:** A `SupplierAssessmentPageData` object.
  - **Type Definition:**
    ```typescript
    export interface SupplierAssessmentPageData {
      TABS: string[];
      FILTERS: {
        topics: string[];
        creators: string[];
      };
      templates: Template[];
    }
    ```

- **POST** `/supplier-assessments`
  - **Description:** Creates a new supplier assessment.
  - **Request Body:** An `AssessmentTemplate` object.
  - **Response Body:** The newly created `Assessment` object.

- **GET** `/assessment-templates/:id`
  - **Description:** Retrieves a specific assessment template by its ID.
  - **Response Body:** An `AssessmentTemplate` object.
  - **Type Definition:**
    ```typescript
    export interface AssessmentTemplate {
      id: string;
      title: string;
      description: string;
      sections: Section[];
    }

    export interface Section {
      id: string;
      title: string;
      questions: Question[];
    }

    export interface Question {
      id: string;
      text: string;
      type: 'text' | 'boolean' | 'multiple-choice';
      options?: string[];
    }
    ```

### Data Integration

- **GET** `/data-integrations`
  - **Description:** Retrieves data related to data integration methods, popular integrations, and recent activities.
  - **Response Body:** A `DataIntegrationsData` object.
  - **Type Definition:**
    ```typescript
    export interface DataIntegrationsData {
      integrationMethods: IntegrationMethod[];
      popularIntegrations: PopularIntegration[];
      recentActivities: RecentActivity[];
    }
    ```

- **GET** `/data-validation`
  - **Description:** Retrieves data for the data validation page, including actors, actions, artifacts, and various data tables.
  - **Response Body:** A `DataValidationData` object.
  - **Type Definition:**
    ```typescript
    export interface DataValidationData {
      actors: Actor[];
      actions: Action[];
      artifacts: Artifact[];
      materialsData: MaterialData[];
      suppliersData: SupplierData[];
      certificationsData: CertificationData[];
      keyHighlights: KeyHighlight[];
    }
    ```

- **GET** `/file-upload`
  - **Description:** Retrieves the supported file types for the file upload page.
  - **Response Body:** A `FileUploadData` object.
  - **Type Definition:**
    ```typescript
    export interface FileUploadData {
      fileTypes: FileType[];
    }
    ```

## SWR Hooks

The application uses SWR for data fetching. The following hooks are available in the `src/api` directory:

- `useSupplierAssessments()`: Fetches all supplier assessments.
- `useGetAssessment(id)`: Fetches a single assessment by ID.
- `useGetTemplate(id)`: Fetches an assessment template by ID.
- `useCreateAssessment(data)`: Creates a new assessment.
- `useSupplierAssessmentPage()`: Fetches data for the supplier assessment page.
- `useDataIntegrations()`: Fetches data for the data integrations page.
- `useDataValidation()`: Fetches data for the data validation page.
- `useFileUpload()`: Fetches data for the file upload page. 