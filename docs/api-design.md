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
- `useTraceabilityRequests()`: Fetches all traceability requests.
- `useTraceabilityRequest(id)`: Fetches a single traceability request with details.
- `useCreateTraceabilityRequest(data)`: Creates a new traceability request.
- `useUpdateTraceabilityRequest(id, data)`: Updates an existing traceability request.
- `useDeleteTraceabilityRequest(id)`: Deletes a traceability request.
- `useTraceabilityAnalytics(query?)`: Fetches analytics data with optional query filters.
- `useSuppliers()`: Fetches available suppliers for requests.
- `useMaterialCodes()`: Fetches available material codes.
- `useProductCodes()`: Fetches available product codes.
- `useActionCodes()`: Fetches available action codes.

### Traceability

- **GET** `/traceability-requests`
  - **Description:** Retrieves a list of all traceability requests for the authenticated brand.
  - **Response Body:** An array of `TraceabilityRequest` objects.
  - **Type Definition:**
    ```typescript
    export interface TraceabilityRequest {
      id: string;
      suppliers: string[];
      assessmentId: string;
      status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
      progress: {
        responded: number;
        total: number;
      };
      createdDate: string;
      lastUpdated: string;
      expirationDate: string;
      artifactTags: string[];
      actionTags: string[];
      message?: string;
      cascadeSettings: CascadeSettings;
    }
    ```

- **GET** `/traceability-requests/:id`
  - **Description:** Retrieves a specific traceability request with detailed supplier responses.
  - **Response Body:** A `TraceabilityRequest` object with expanded `supplierResponses` array.
  - **Type Definition:**
    ```typescript
    export interface TraceabilityRequestDetail extends TraceabilityRequest {
      supplierResponses: SupplierResponse[];
    }
    ```

- **POST** `/traceability-requests`
  - **Description:** Creates a new traceability request.
  - **Request Body:** A `CreateTraceabilityRequest` object.
  - **Response Body:** The newly created `TraceabilityRequest` object.

- **PUT** `/traceability-requests/:id`
  - **Description:** Updates an existing traceability request.
  - **Request Body:** A partial `TraceabilityRequest` object.
  - **Response Body:** The updated `TraceabilityRequest` object.

- **DELETE** `/traceability-requests/:id`
  - **Description:** Deletes a traceability request.
  - **Response Body:** Success confirmation.

- **GET** `/traceability-analytics`
  - **Description:** Retrieves analytics data for traceability dashboard.
  - **Query Parameters:** Optional `AnalyticsQuery` object for filtering.
  - **Response Body:** A `TraceabilityAnalytics` object.

- **GET** `/suppliers`
  - **Description:** Retrieves available suppliers for selection in requests.
  - **Response Body:** An array of `Supplier` objects.

- **GET** `/material-codes`
  - **Description:** Retrieves available material codes for tagging.
  - **Response Body:** An array of `MaterialCode` objects.

- **GET** `/product-codes`
  - **Description:** Retrieves available product codes for tagging.
  - **Response Body:** An array of `ProductCode` objects.

- **GET** `/action-codes`
  - **Description:** Retrieves available action codes for tagging.
  - **Response Body:** An array of `ActionCode` objects. 