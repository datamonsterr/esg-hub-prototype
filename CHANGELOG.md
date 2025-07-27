# ESG Hub Schema and API Changes

## Summary of Changes Made

This document outlines the changes made to align the ESG Hub prototype with the updated concept where organizations own their products and use traceability requests to get information about components from other organizations.

## 1. Database Schema Changes (`docs/schema.sql`)

### Products Table
- **REMOVED**: `supplier_organization_id` column and its foreign key constraint
- **UPDATED**: Comments to clarify that organizations own their products and use traceability requests for supplier information
- **REMOVED**: Index `idx_products_supplier_id` since the column no longer exists

### Rationale
- Organizations now only own their own products/components
- Supplier relationships are established through traceability requests rather than direct foreign key relationships
- This supports the tier-1, tier-2, etc. supplier information sharing model

## 2. Type Definitions

### Product Types (`src/types/product.ts`)
- **REMOVED**: `supplierOrganizationId` field from `Product` interface
- **REMOVED**: `supplierOrganizationId` field from `CreateProductRequest` interface
- **ADDED**: `traceabilityStatus` and `hasDetailedInfo` fields to track traceability request status
- **UPDATED**: Comments to reflect the new supplier information approach

### Traceability Types (`src/types/traceability.ts`)
- **UPDATED**: `CreateTraceabilityRequest` to use `productIds: number[]` instead of separate component IDs
- **UPDATED**: `CreateTraceabilityRequest` to use `assessmentId: number` instead of template ID
- **REMOVED**: `componentIds` and `assessmentTemplateId` fields
- **UPDATED**: Field types to match the actual database schema

## 3. API Changes

### Product API (`src/api/product.ts`)
- **ADDED**: `getProductsWithTraceabilityStatus()` function to fetch products with their traceability request status
- **UPDATED**: `getSuppliers()` function to determine suppliers from traceability requests instead of product foreign keys
- **UPDATED**: `useGetProducts()` hook to support `includeTraceability` option
- **REMOVED**: All references to `supplierOrganizationId` in favor of metadata storage

### Products Route (`src/app/api/products/route.ts`)
- **ADDED**: `parent_id` to allowed filters for better hierarchical querying
- **REMOVED**: References to supplier organization ID validation

### Integration API (`src/api/integration.ts`)
- **UPDATED**: Store supplier information in product metadata instead of foreign key reference
- **CHANGED**: `supplierOrganizationId: null` to `supplier: item.supplier` in metadata

## 4. Component Changes

### Product Form (`src/components/products/product-form-backup.tsx`)
- **REMOVED**: `supplierOrganizationId` field from form schema
- **ADDED**: `supplier` field to metadata object for storing supplier names

### Product Tree Validation (`src/components/validation/extracted-product-tree.tsx`)
- **UPDATED**: Mock data to store supplier information in metadata instead of organization IDs
- **UPDATED**: `updateSupplierByPath()` function to update metadata.supplier instead of supplierOrganizationId
- **UPDATED**: UI to use supplier names from metadata instead of organization IDs
- **FIXED**: Input value handling for nullable description fields

## 5. Data Updates

### Products CSV (`data/products.csv`)
- **REMOVED**: `supplier_organization_id` column from all product records
- **UPDATED**: CSV header to reflect new schema structure
- **MAINTAINED**: All product hierarchical relationships and other data integrity

## 6. How the New System Works

### Product Ownership
- Each organization owns and manages their own products
- Products can have hierarchical relationships (parent_id) within the same organization
- Supplier information is stored in metadata when known

### Traceability Requests
- Organizations make traceability requests to get information about products from other organizations
- Target organizations can approve/reject these requests
- When approved, detailed product information becomes available
- When rejected, only limited information is shown

### Information Sharing
- **Before approval**: Limited product information visible
- **After approval**: Full product tree and detailed information accessible
- **Traceability status tracking**: Products now have status indicators showing request state

## 7. Benefits of This Approach

1. **Clear ownership boundaries**: Each organization controls their own product data
2. **Controlled information sharing**: Suppliers can approve/reject information requests
3. **Audit trail**: All information sharing is tracked through traceability requests
4. **Scalable**: Supports multi-tier supply chain relationships
5. **Compliance-friendly**: Organizations can control what information they share

## 8. Migration Notes

For existing deployments:
1. Remove `supplier_organization_id` column from products table
2. Remove associated foreign key constraint and index
3. Update any existing supplier references to use traceability requests
4. Migrate existing supplier data to metadata fields where appropriate

## 9. Future Enhancements

- Add batch traceability requests for multiple products
- Implement automatic cascading requests to tier-2, tier-3 suppliers
- Add expiration dates for approved traceability sharing
- Implement role-based access controls for different levels of information sharing
