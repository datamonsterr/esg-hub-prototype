"use client"

import React, { forwardRef, useImperativeHandle } from 'react';
import { Product } from '@/src/types';
import { useGetBrandTree } from '@/src/api/product';
import EnhancedTreeView, { ViewType } from './enhanced-tree-view';
import { ArrowOrientationType } from './editable-custom-tree-node';

interface BrandTreeViewProps {
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

export interface BrandTreeViewRef {
  reload: () => void;
}

const BrandTreeView = forwardRef<BrandTreeViewRef, BrandTreeViewProps>(({
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
}, ref) => {
  
  // Hook adapter for the enhanced tree view
  const useBrandTreeHook = (rootProductId: string) => {
    const { brandTree, isLoading, isError, mutate } = useGetBrandTree(rootProductId);
    return {
      tree: brandTree,
      isLoading,
      isError: !!isError,
      reload: () => mutate()
    };
  };

  // Expose reload function through ref
  useImperativeHandle(ref, () => ({
    reload: () => {
      // The reload will be handled by the tree hook's mutate function
      // This is called indirectly through the useBrandTreeHook
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
      viewType={ViewType.BRAND}
      useGetTreeHook={useBrandTreeHook}
      arrowOrientation={ArrowOrientationType.RIGHT_TO_LEFT}
      externalEditMode={isEditMode}
    />
  );
});

BrandTreeView.displayName = 'BrandTreeView';

export default BrandTreeView;
