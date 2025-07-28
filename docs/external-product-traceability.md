# Handling External Products in the Product Tree View

This document explains the implementation of the feature that allows users to identify products from other organizations and request traceability information.

## Overview

In the product hierarchy view, products can belong to the current organization or to external organizations. When a user selects an external product, they should see limited information and have the option to request traceability data from the organization that owns that product.

## Implementation Details

### Product Tree View Component

The `product-tree-view.tsx` component has been updated to:

1. Accept a `currentOrganizationId` prop to identify which products belong to the current organization
2. Visually distinguish external products in the tree with:
   - Amber/yellow color scheme
   - "External" label
   - Different border style

3. When a user selects an external product:
   - Show a limited information panel
   - Display a warning that the product belongs to another organization
   - Provide a "Request Traceability Information" button

4. The button redirects to the traceability request creation page with query parameters:
   - `productId`: The ID of the external product
   - `supplierOrgId`: The organization ID that owns the external product

### Traceability Request Creation

The traceability request creation page (`/traceability/outgoing/create/page.tsx`) has been updated to:

1. Handle URL query parameters from the product tree view
2. Pre-select the product and supplier organization when redirected from the tree
3. Show details of the pre-selected product
4. Generate a default message based on the product information

### Data Structure

The implementation relies on the following data structures:

1. Products with `organizationId` field to identify ownership
2. Traceability requests that link requesting organizations, target organizations, and products

## How to Use

To use this feature:

1. Ensure that products in the database have the correct `organizationId` set
2. When rendering the `ProductTreeView` component, pass the current organization's ID as the `currentOrganizationId` prop
3. When creating products with parent/child relationships, ensure the correct cross-organizational links are established

## Example

```tsx
// Example usage of ProductTreeView with organization ID
<ProductTreeView
  products={products}
  onEdit={handleEdit}
  onDelete={handleDelete}
  currentOrganizationId="42f5e6c7-a3bd-4dfa-a6e4-8b82328bc4a8"
/>
```

This will ensure that products from other organizations are properly identified and allow users to request traceability information.
