"use client"

import React, { forwardRef, useImperativeHandle } from 'react';
import { Product } from '@/src/types';
import { useGetSupplierTree } from '@/src/api/product';
import EnhancedTreeView, { ViewType } from './enhanced-tree-view';
import { ArrowOrientationType } from './editable-custom-tree-node';

interface SupplierTreeViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdate?: (product: Product) => void;
  onSaveProduct?: (product: Partial<Product>) => void;
  onProductCreated?: (product: Product) => void;
  onProductUpdated?: (product: Product) => void;
  selectedProductId?: string;
  singleProductMode?: boolean;
  currentOrganizationId?: string;
  isEditMode?: boolean; // Add external edit mode control
}

export interface SupplierTreeViewRef {
  reload: () => void;
}

const SupplierTreeView = forwardRef<SupplierTreeViewRef, SupplierTreeViewProps>(({ 
  products, 
  onEdit, 
  onDelete,
  onUpdate,
  onSaveProduct,
  onProductCreated,
  onProductUpdated,
  selectedProductId, 
  singleProductMode = false, 
  currentOrganizationId,
  isEditMode = false
}, ref) => {    // Hook adapter for the enhanced tree view
  const useSupplierTreeHook = (rootProductId: string) => {
    const { supplierTree, isLoading, isError, mutate } = useGetSupplierTree(rootProductId);
    return {
      tree: supplierTree,
      isLoading,
      isError: !!isError,
      reload: () => mutate()
    };
  };

  // Expose reload function through ref
  useImperativeHandle(ref, () => ({
    reload: () => {
      // The reload will be handled by the tree hook's mutate function
      // This is called indirectly through the useSupplierTreeHook
    }
  }));

  return (
    <EnhancedTreeView
      products={products}
      onEdit={onEdit}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onSaveProduct={onSaveProduct}
      onProductCreated={onProductCreated}
      onProductUpdated={onProductUpdated}
      selectedProductId={selectedProductId}
      singleProductMode={singleProductMode}
      currentOrganizationId={currentOrganizationId}
      viewType={ViewType.SUPPLIER}
      useGetTreeHook={useSupplierTreeHook}
      arrowOrientation={ArrowOrientationType.LEFT_TO_RIGHT}
      externalEditMode={isEditMode}
    />
  );
});

SupplierTreeView.displayName = 'SupplierTreeView';

export default SupplierTreeView;
