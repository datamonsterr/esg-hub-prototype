# Enhanced Tree View Edit Functionality

This document describes the new edit functionality implemented for the product tree views in the ESG Hub prototype.

## Overview

The enhanced tree view system provides:
1. **Edit Mode Toggle**: Switch between view-only and edit modes
2. **Interactive Node Editing**: Click/hover on nodes to add child products
3. **Unified Edit Panel**: Editable product details panel for creating/editing products
4. **Shared Components**: Reusable components across supplier and brand tree views

## Components Created

### 1. TreeEditContext (`tree-edit-context.tsx`)
A React context that manages edit mode state across the tree view components.

**Key State:**
- `isEditMode`: Boolean indicating if edit mode is active
- `selectedNodeForEdit`: Currently selected product for editing
- `showEditPanel`: Boolean controlling edit panel visibility
- `editAction`: 'edit' | 'add' | null - current action being performed
- `pendingParentId`: ID of parent product when adding new child

### 2. EditableCustomTreeNode (`editable-custom-tree-node.tsx`)
Enhanced tree node component that supports edit mode interactions.

**Features:**
- Hover effects in edit mode
- Add child button that appears on hover
- Click handling for edit vs view modes
- Visual indicators for edit mode

### 3. EditableProductDetailsPanel (`editable-product-details-panel.tsx`)
A comprehensive edit form for product creation and editing.

**Features:**
- Basic product information fields (name, SKU, description, etc.)
- Product type and category selection
- Custom properties management
- Save/cancel functionality
- Form validation

### 4. EnhancedTreeView (`enhanced-tree-view.tsx`)
Main component that orchestrates the enhanced tree view functionality.

**Features:**
- Edit mode toggle button
- Tree view rendering with edit capabilities
- Panel switching between view and edit modes
- Hook integration for different tree types

## Updated Components

### 1. SupplierTreeView (`supplier-tree-view.tsx`)
Simplified to use the new EnhancedTreeView component with supplier-specific configuration.

### 2. BrandTreeView (`brand-tree-view.tsx`)
Simplified to use the new EnhancedTreeView component with brand-specific configuration.

### 3. ProductTreeView (`product-tree-view.tsx`)
Updated to pass the `onSaveProduct` prop to child components.

## Usage Example

```tsx
import ProductTreeView from '@/src/components/management/product-tree-view';

function ProductManagementPage() {
  const handleSaveProduct = (productData: Partial<Product>) => {
    // Handle saving new/edited product
    console.log('Save product:', productData);
    // Call your API to save the product
  };

  return (
    <ProductTreeView 
      products={products}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onSaveProduct={handleSaveProduct}
      currentOrganizationId={organizationId}
    />
  );
}
```

## How It Works

### 1. Edit Mode Activation
- Click the "Edit Mode" button to enter edit mode
- Button changes to "Cancel Edit" with an X icon
- Tree nodes become interactive for adding children

### 2. Adding Child Products
- In edit mode, hover over any tree node
- A green "+" button appears next to the node
- Click the "+" button to open the edit panel for adding a child product
- The new product will be created as a child of the selected node

### 3. Editing Existing Products
- Click the edit button in the product details panel (works in both modes)
- Or in edit mode, click directly on a tree node to edit it
- The edit panel opens with the product's current data pre-filled

### 4. Edit Panel Features
- **Basic Information**: Name, SKU, description, category, type
- **Quantity & Unit**: Numeric quantity and unit specification
- **Status**: Active, inactive, or discontinued
- **Custom Properties**: Add/remove custom key-value pairs
- **Save/Cancel**: Save changes or cancel editing

### 5. Visual Feedback
- Edit mode shows hover effects and interaction hints
- Selected nodes are highlighted with green borders
- External products (from other organizations) show amber styling
- Add buttons are clearly marked with green styling

## Configuration

### Tree Configuration (`tree-config.ts`)
Updated to provide better spacing and interaction for edit mode:
- Increased node spacing for edit buttons
- Enabled zoom functionality (0.5x to 2x)
- Smooth transitions for better UX
- Increased depth factor for better spacing

### Arrow Orientations
- **Supplier View**: Left-to-right arrows (components → final products)
- **Brand View**: Right-to-left arrows (final products → components)

## Integration Points

The enhanced tree view integrates with:
1. **Product API**: Uses existing `useGetSupplierTree` and `useGetBrandTree` hooks
2. **Edit Callbacks**: Calls `onSaveProduct` when products are created/updated
3. **Organization Context**: Respects organization boundaries for edit permissions
4. **Existing UI Components**: Uses shadcn/ui components throughout

## Best Practices

1. **Always provide onSaveProduct**: Ensure the parent component handles product saving
2. **Handle loading states**: The edit panel shows during async operations
3. **Validate permissions**: External products cannot be edited
4. **Provide feedback**: Use the callback functions to show success/error messages
5. **Refresh data**: After saving, refresh the tree data to show changes

## Future Enhancements

Potential improvements:
1. **Drag & Drop**: Reorder tree nodes by dragging
2. **Bulk Operations**: Select multiple nodes for batch operations
3. **Undo/Redo**: Implement operation history
4. **Real-time Updates**: Live updates when other users make changes
5. **Advanced Validation**: Server-side validation integration
6. **Templates**: Product templates for quick creation
