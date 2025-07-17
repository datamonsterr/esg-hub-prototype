# API Design - Organization-Based System

This document outlines the API structure for the restructured ESG Hub platform. The API is powered by `json-server` and provides endpoints for organization-based supply chain management.

## Base URL

The mock server runs on `http://localhost:3001`.

## Core Concepts

### Organizations
Organizations are the central entities that can be suppliers, manufacturers, brands, or any entity in the supply chain. Each organization manages their own products and participates in traceability requests.

### Products
Products are items manufactured or sold by organizations. Each product has a Bill of Materials (BOM) represented as a component tree structure.

### Components
Components are parts, materials, or sub-assemblies that make up products. They form hierarchical relationships in the BOM structure.

### Traceability Requests
Bidirectional requests between organizations to gather information about products, components, or processes. Requests can be incoming (received) or outgoing (sent).

## API Endpoints

### Organizations

- **GET** `/organizations`
  - **Description:** Retrieves a list of all organizations in the system.
  - **Response Body:** An array of `Organization` objects.
  - **Type Definition:**
    ```typescript
    export interface Organization {
      id: string;
      name: string;
      type: string; // "manufacturer", "supplier", "brand", etc.
      address: string;
      contactEmail: string;
      capabilities: string[]; // ["manufacturing", "sourcing", "testing"]
      certifications: string[];
      verificationStatus: "verified" | "pending" | "unverified";
      createdAt: string;
      updatedAt: string;
    }
    ```

- **GET** `/organizations/:id`
  - **Description:** Retrieves a specific organization by ID.
  - **Response Body:** An `Organization` object.

- **PUT** `/organizations/:id`
  - **Description:** Updates organization information.
  - **Request Body:** Partial `Organization` object.
  - **Response Body:** Updated `Organization` object.

### Products

- **GET** `/products`
  - **Description:** Retrieves products for the authenticated organization.
  - **Query Parameters:** `organizationId`, `category`, `search`
  - **Response Body:** An array of `Product` objects.
  - **Type Definition:**
    ```typescript
    export interface Product {
      id: string;
      organizationId: string;
      name: string;
      sku: string;
      description: string;
      category: string;
      componentTreeId?: string; // Root component ID
      metadata: ProductMetadata;
      dataCompleteness: number; // 0-100%
      missingDataFields: string[];
      createdAt: string;
      updatedAt: string;
    }

    export interface ProductMetadata {
      sustainabilityScore?: number;
      certifications: string[];
      originCountry?: string;
      carbonFootprint?: number;
      weightKg?: number;
      dimensions?: {
        length: number;
        width: number;
        height: number;
      };
    }
    ```

- **POST** `/products`
  - **Description:** Creates a new product.
  - **Request Body:** `CreateProductRequest` object.
  - **Response Body:** Created `Product` object.

- **GET** `/products/:id`
  - **Description:** Retrieves a specific product with its component tree.
  - **Response Body:** `ProductDetail` object.
  - **Type Definition:**
    ```typescript
    export interface ProductDetail extends Product {
      componentTree?: ComponentNode;
      suppliers: Organization[];
      traceabilityRequests: TraceabilityRequest[];
    }
    ```

- **PUT** `/products/:id`
  - **Description:** Updates a product.
  - **Request Body:** Partial `Product` object.
  - **Response Body:** Updated `Product` object.

- **DELETE** `/products/:id`
  - **Description:** Deletes a product.
  - **Response Body:** Success confirmation.

### Components

- **GET** `/components`
  - **Description:** Retrieves components for an organization or product.
  - **Query Parameters:** `organizationId`, `productId`, `parentId`
  - **Response Body:** An array of `Component` objects.
  - **Type Definition:**
    ```typescript
    export interface Component {
      id: string;
      organizationId: string;
      productId?: string;
      parentId?: string; // For hierarchical structure
      name: string;
      type: "raw_material" | "sub_assembly" | "component" | "final_product";
      sku?: string;
      description: string;
      quantity: number;
      unit: string;
      supplierOrganizationId?: string;
      metadata: ComponentMetadata;
      dataCompleteness: number;
      missingDataFields: string[];
      createdAt: string;
      updatedAt: string;
    }

    export interface ComponentMetadata {
      materialType?: string;
      originCountry?: string;
      certifications: string[];
      sustainabilityScore?: number;
      carbonFootprint?: number;
      recycledContent?: number;
      hazardousSubstances?: string[];
    }

    export interface ComponentNode extends Component {
      children: ComponentNode[];
    }
    ```

- **POST** `/components`
  - **Description:** Creates a new component.
  - **Request Body:** `CreateComponentRequest` object.
  - **Response Body:** Created `Component` object.

- **GET** `/components/:id/tree`
  - **Description:** Retrieves a component and its full subtree.
  - **Response Body:** `ComponentNode` object.

- **PUT** `/components/:id`
  - **Description:** Updates a component.
  - **Request Body:** Partial `Component` object.
  - **Response Body:** Updated `Component` object.

### Traceability Requests

- **GET** `/traceability-requests/incoming`
  - **Description:** Retrieves traceability requests received by the organization.
  - **Query Parameters:** `status`, `priority`, `dateFrom`, `dateTo`
  - **Response Body:** An array of `TraceabilityRequest` objects.

- **GET** `/traceability-requests/outgoing`
  - **Description:** Retrieves traceability requests sent by the organization.
  - **Query Parameters:** `status`, `priority`, `dateFrom`, `dateTo`
  - **Response Body:** An array of `TraceabilityRequest` objects.

- **GET** `/traceability-requests/:id`
  - **Description:** Retrieves a specific traceability request with details.
  - **Response Body:** `TraceabilityRequestDetail` object.
  - **Type Definition:**
    ```typescript
    export interface TraceabilityRequest {
      id: string;
      requestingOrganizationId: string;
      targetOrganizationId: string;
      productIds: string[];
      componentIds: string[];
      assessmentTemplateId: string;
      status: "pending" | "in_progress" | "completed" | "rejected" | "overdue";
      priority: "low" | "medium" | "high" | "urgent";
      dueDate: string;
      message?: string;
      cascadeSettings: CascadeSettings;
      createdAt: string;
      updatedAt: string;
    }

    export interface CascadeSettings {
      enableCascade: boolean;
      targetTiers: string[]; // ["tier-2", "tier-3"]
      cascadeScope: "all" | "material-specific" | "risk-based";
      cascadeTiming: "immediate" | "after-response" | "manual";
      autoReminder: boolean;
    }

    export interface TraceabilityRequestDetail extends TraceabilityRequest {
      requestingOrganization: Organization;
      targetOrganization: Organization;
      products: Product[];
      components: Component[];
      assessmentTemplate: AssessmentTemplate;
      responses: TraceabilityResponse[];
      cascadedRequests: TraceabilityRequest[];
    }
    ```

- **POST** `/traceability-requests`
  - **Description:** Creates a new traceability request.
  - **Request Body:** `CreateTraceabilityRequest` object.
  - **Response Body:** Created `TraceabilityRequest` object.

- **PUT** `/traceability-requests/:id`
  - **Description:** Updates a traceability request (e.g., status, response).
  - **Request Body:** Partial `TraceabilityRequest` or response data.
  - **Response Body:** Updated `TraceabilityRequest` object.

- **POST** `/traceability-requests/:id/respond`
  - **Description:** Submits a response to a traceability request.
  - **Request Body:** `TraceabilityResponse` object.
  - **Response Body:** Updated request with response.

### Data Integration

- **POST** `/data-integration/upload`
  - **Description:** Uploads a file for processing.
  - **Request Body:** FormData with file and metadata.
  - **Response Body:** Upload confirmation with processing ID.
  - **Type Definition:**
    ```typescript
    export interface UploadResponse {
      id: string;
      fileName: string;
      fileSize: number;
      fileType: string;
      status: "uploaded" | "processing" | "completed" | "failed";
      processingId: string;
    }
    ```

- **POST** `/data-integration/process`
  - **Description:** Processes an uploaded file and extracts product/component data.
  - **Request Body:** `ProcessRequest` object.
  - **Response Body:** `ProcessResult` object.
  - **Type Definition:**
    ```typescript
    export interface ProcessRequest {
      processingId: string;
      selectedProductId?: string;
      extractionType: "product" | "components" | "bom";
      organizationId: string;
    }

    export interface ProcessResult {
      id: string;
      status: "processing" | "completed" | "failed";
      extractedData: {
        products: Product[];
        components: Component[];
        componentTree: ComponentNode;
      };
      dataQuality: {
        completeness: number;
        accuracy: number;
        missingFields: string[];
      };
      suggestedActions: string[];
    }
    ```

- **GET** `/data-integration/process/:id`
  - **Description:** Gets the status and results of a processing job.
  - **Response Body:** `ProcessResult` object.

### Assessment Templates

- **GET** `/assessment-templates`
  - **Description:** Retrieves assessment templates available to the organization.
  - **Query Parameters:** `category`, `dataType`, `organizationId`
  - **Response Body:** An array of `AssessmentTemplate` objects.
  - **Type Definition:**
    ```typescript
    export interface AssessmentTemplate {
      id: string;
      title: string;
      description: string;
      category: string;
      targetDataTypes: string[]; // Product data fields this template helps collect
      createdByOrganizationId: string;
      isPublic: boolean;
      sections: AssessmentSection[];
      createdAt: string;
      updatedAt: string;
    }

    export interface AssessmentSection {
      id: string;
      title: string;
      description?: string;
      questions: AssessmentQuestion[];
    }

    export interface AssessmentQuestion {
      id: string;
      text: string;
      type: "text" | "boolean" | "multiple-choice" | "file-upload" | "number";
      isRequired: boolean;
      productDataField?: string; // Maps to product/component data field
      validationRules?: ValidationRule[];
      options?: QuestionOption[];
    }

    export interface QuestionOption {
      id: string;
      text: string;
      value: string;
    }

    export interface ValidationRule {
      type: "min" | "max" | "pattern" | "required";
      value: any;
      message: string;
    }
    ```

- **POST** `/assessment-templates`
  - **Description:** Creates a new assessment template.
  - **Request Body:** `CreateAssessmentTemplate` object.
  - **Response Body:** Created `AssessmentTemplate` object.

- **GET** `/assessment-templates/:id`
  - **Description:** Retrieves a specific assessment template.
  - **Response Body:** `AssessmentTemplate` object.

### Analytics & Reporting

- **GET** `/analytics/organization/:id`
  - **Description:** Retrieves analytics data for an organization.
  - **Response Body:** `OrganizationAnalytics` object.
  - **Type Definition:**
    ```typescript
    export interface OrganizationAnalytics {
      productCount: number;
      componentCount: number;
      traceabilityCompleteness: number;
      supplierCount: number;
      customerCount: number;
      dataQualityScore: number;
      recentActivities: Activity[];
      traceabilityTrends: TrendData[];
    }
    ```

- **GET** `/analytics/products/:id/traceability`
  - **Description:** Retrieves traceability analytics for a specific product.
  - **Response Body:** `ProductTraceabilityAnalytics` object.

## useSWR Hooks

Following the API naming convention (axios handlers + useSWR wrappers):

### Organizations
- `getOrganizations()` → `useGetOrganizations()`
- `getOrganizationById(id)` → `useGetOrganization(id)`
- `updateOrganization(id, data)` → `useUpdateOrganization()`

### Products
- `getProducts(params)` → `useGetProducts(params)`
- `createProduct(data)` → `useCreateProduct()`
- `getProductById(id)` → `useGetProduct(id)`
- `updateProduct(id, data)` → `useUpdateProduct()`
- `deleteProduct(id)` → `useDeleteProduct()`

### Components
- `getComponents(params)` → `useGetComponents(params)`
- `createComponent(data)` → `useCreateComponent()`
- `getComponentTree(id)` → `useGetComponentTree(id)`
- `updateComponent(id, data)` → `useUpdateComponent()`

### Traceability
- `getIncomingRequests(params)` → `useGetIncomingRequests(params)`
- `getOutgoingRequests(params)` → `useGetOutgoingRequests(params)`
- `getTraceabilityRequest(id)` → `useGetTraceabilityRequest(id)`
- `createTraceabilityRequest(data)` → `useCreateTraceabilityRequest()`
- `updateTraceabilityRequest(id, data)` → `useUpdateTraceabilityRequest()`
- `respondToRequest(id, response)` → `useRespondToRequest()`

### Data Integration
- `uploadFile(file, metadata)` → `useUploadFile()`
- `processFile(request)` → `useProcessFile()`
- `getProcessStatus(id)` → `useGetProcessStatus(id)`

### Assessment Templates
- `getAssessmentTemplates(params)` → `useGetAssessmentTemplates(params)`
- `createAssessmentTemplate(data)` → `useCreateAssessmentTemplate()`
- `getAssessmentTemplate(id)` → `useGetAssessmentTemplate(id)`

### Analytics
- `getOrganizationAnalytics(id)` → `useGetOrganizationAnalytics(id)`
- `getProductTraceabilityAnalytics(id)` → `useGetProductTraceabilityAnalytics(id)`

### User Management
- `getOrganizationMembers(organizationId)` → `useGetOrganizationMembers(organizationId)`
- `addOrganizationMember(organizationId, data)` → `useAddOrganizationMember()`
- `updateMemberRole(organizationId, memberId, role)` → `useUpdateMemberRole()`
- `removeMember(organizationId, memberId)` → `useRemoveMember()`
- `getOrganizationInvites(organizationId)` → `useGetOrganizationInvites(organizationId)`
- `sendInvite(data)` → `useSendInvite()`
- `resendInvite(inviteId)` → `useResendInvite()`
- `cancelInvite(inviteId)` → `useCancelInvite()`
- `acceptInvite(token)` → `useAcceptInvite()`
- `getUserProfile()` → `useGetUserProfile()`
- `updateUserProfile(data)` → `useUpdateUserProfile()`

### User Management

- **GET** `/organizations/:id/members`
  - **Description:** Retrieves members of a specific organization.
  - **Response Body:** An array of `OrganizationMember` objects.
  - **Type Definition:**
    ```typescript
    export interface OrganizationMember {
      id: string;
      userId: string;
      organizationId: string;
      role: "admin" | "employee";
      status: "active" | "pending" | "suspended";
      invitedBy?: string;
      invitedAt?: string;
      joinedAt?: string;
      permissions: string[];
      createdAt: string;
      updatedAt: string;
    }
    ```

- **POST** `/organizations/:id/members`
  - **Description:** Adds a new member to the organization.
  - **Request Body:** `CreateMemberRequest` object.
  - **Response Body:** Created `OrganizationMember` object.

- **PUT** `/organizations/:orgId/members/:memberId`
  - **Description:** Updates a member's role or status.
  - **Request Body:** Partial `OrganizationMember` object.
  - **Response Body:** Updated `OrganizationMember` object.

- **DELETE** `/organizations/:orgId/members/:memberId`
  - **Description:** Removes a member from the organization.
  - **Response Body:** Success confirmation.

- **GET** `/organizations/:id/invites`
  - **Description:** Retrieves pending invitations for an organization.
  - **Response Body:** An array of `InviteRequest` objects.
  - **Type Definition:**
    ```typescript
    export interface InviteRequest {
      id: string;
      email: string;
      organizationId: string;
      organizationRole: "admin" | "employee";
      invitedBy: string;
      status: "pending" | "sent" | "accepted" | "expired";
      token: string;
      expiresAt: string;
      createdAt: string;
    }
    ```

- **POST** `/invites/send`
  - **Description:** Sends an invitation to join an organization.
  - **Request Body:** `SendInviteRequest` object.
  - **Response Body:** Created `InviteRequest` object.

- **POST** `/invites/accept/:token`
  - **Description:** Accepts an invitation using the token.
  - **Response Body:** User and organization information.

- **POST** `/invites/:id/resend`
  - **Description:** Resends an invitation.
  - **Response Body:** Updated `InviteRequest` object.

- **DELETE** `/invites/:id/cancel`
  - **Description:** Cancels a pending invitation.
  - **Response Body:** Success confirmation.

- **GET** `/users/profile`
  - **Description:** Retrieves the current user's profile.
  - **Response Body:** `User` object.
  - **Type Definition:**
    ```typescript
    export interface User {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      fullName?: string;
      imageUrl?: string;
      organizationId: string;
      organizationRole: "admin" | "employee";
      isActive: boolean;
      invitedAt?: string;
      joinedAt?: string;
      lastLoginAt?: string;
      createdAt: string;
      updatedAt: string;
    }
    ```

- **PUT** `/users/profile`
  - **Description:** Updates the current user's profile.
  - **Request Body:** Partial `User` object.
  - **Response Body:** Updated `User` object.

### Organization Access Control

The system now uses organization-based access control instead of role-based (supplier/brand) access:

- **Organization Membership:** Users must belong to an organization to access most features
- **Organization Roles:** 
  - **Admin:** Can manage organization settings, invite/remove users, assign roles
  - **Employee:** Can use all organization features except user management
- **Clerk Metadata:** User metadata now contains `organizationId` and `organizationRole` instead of `userRole`

## Authentication Context

Updated to use organization-based authentication:

```typescript
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  organizationId: string;
  organizationRole: "admin" | "employee";
  organization: Organization;
  permissions: string[];
}
```

## Error Handling

All endpoints follow consistent error response format:

```typescript
export interface ApiError {
  error: string;
  message: string;
  code: number;
  details?: any;
}
```

Common error codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error 