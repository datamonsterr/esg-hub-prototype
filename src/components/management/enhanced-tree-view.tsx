"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, ProductNode } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Edit, X } from 'lucide-react';
import { Tree } from 'react-d3-tree';
import { CustomNodeElementProps } from 'react-d3-tree';
import { TreeEditProvider, useTreeEdit } from './tree-edit-context';
import EditableCustomTreeNode, { ArrowOrientationType } from './editable-custom-tree-node';
import ProductDetailsPanel from './product-details-panel';
import EditableProductDetailsPanel from './editable-product-details-panel';
import { DEFAULT_TREE_CONFIG } from './tree-config';

export enum ViewType {
  SUPPLIER = 'supplier',
  BRAND = 'brand',
}

interface EnhancedTreeViewProps {
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
  viewType: ViewType;
  useGetTreeHook: (rootProductId: string) => {
    tree: any;
    isLoading: boolean;
    isError: boolean;
  };
  arrowOrientation: ArrowOrientationType;
  externalEditMode?: boolean; // External edit mode control
}

// Inner component that uses the TreeEdit context
const EnhancedTreeViewInner = ({
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
  viewType,
  useGetTreeHook,
  arrowOrientation,
  externalEditMode = false
}: EnhancedTreeViewProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRootProductId, setSelectedRootProductId] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Map<string, Product>>(new Map());
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const {
    isEditMode,
    setIsEditMode,
    showEditPanel,
    setShowEditPanel,
    setEditAction,
    setSelectedNodeForEdit
  } = useTreeEdit();

  // Initialize with the provided products
  useEffect(() => {
    const productMap = new Map(products.map(p => [p.id, p]));
    setAllProducts(productMap);
  }, [products]);

  // Sync external edit mode with internal edit mode
  useEffect(() => {
    if (externalEditMode !== isEditMode) {
      setIsEditMode(externalEditMode);
      if (!externalEditMode) {
        // If exiting edit mode, clean up
        setShowEditPanel(false);
        setEditAction(null);
        setSelectedNodeForEdit(null);
      }
    }
  }, [externalEditMode, isEditMode, setIsEditMode, setShowEditPanel, setEditAction, setSelectedNodeForEdit]);

  // Auto-select the specified product when component loads
  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      const targetProduct = products.find(p => p.id === selectedProductId);
      if (targetProduct) {
        setSelectedProduct(targetProduct);
        setSelectedRootProductId(selectedProductId);
      }
    }
  }, [selectedProductId, products]);

  // Find root products based on view type
  const rootProducts = useMemo(() => {
    if (viewType === ViewType.SUPPLIER) {
      // For supplier view, find products that aren't children of any other product
      const allChildIds = new Set(products.flatMap(p => p.childrenIds || []));
      return products.filter(p => 
        !allChildIds.has(p.id) || 
        ((!p.parentIds || p.parentIds.length === 0) && (!p.childrenIds || p.childrenIds.length === 0))
      );
    } else {
      // For brand view, find components that are used by other products
      const usedProducts = new Set<string>();
      products.forEach(product => {
        if (product.parentIds && product.parentIds.length > 0) {
          product.parentIds.forEach(parentId => {
            usedProducts.add(parentId);
          });
        }
      });
      const result = products.filter(p => usedProducts.has(p.id));
      return result.length === 0 ? products : result;
    }
  }, [products, viewType]);

  // Get the currently selected root product for display
  const currentRootProduct = useMemo(() => {
    if (singleProductMode && products.length > 0) {
      return products[0];
    }
    
    if (selectedRootProductId) {
      const explicitSelection = rootProducts.find(p => p.id === selectedRootProductId);
      if (explicitSelection) return explicitSelection;
    }
    
    if (selectedProductId) {
      const targetProduct = rootProducts.find(p => p.id === selectedProductId);
      if (targetProduct) return targetProduct;
    }
    
    return rootProducts[0] || null;
  }, [rootProducts, selectedRootProductId, selectedProductId, singleProductMode, products]);

  // Use the provided tree hook
  const { tree, isLoading, isError } = useGetTreeHook(currentRootProduct?.id || '');

  // Convert tree to react-d3-tree format
  const treeData = useMemo(() => {
    if (!tree) return [];
    return [tree];
  }, [tree]);

  // Build allProducts map from the tree for the CustomTreeNode component
  useEffect(() => {
    if (!tree) return;

    const extractAllProducts = (treeNode: any, productMap: Map<string, Product>) => {
      if (treeNode.attributes) {
        const product: Product = {
          id: treeNode.attributes.productId,
          name: treeNode.name,
          sku: treeNode.attributes.sku,
          type: treeNode.attributes.type,
          category: treeNode.attributes.category,
          description: treeNode.attributes.description,
          quantity: treeNode.attributes.quantity,
          unit: treeNode.attributes.unit,
          status: treeNode.attributes.status,
          organizationId: currentOrganizationId || '',
          dataCompleteness: 100,
          missingDataFields: [],
          childrenIds: treeNode.children?.map((child: any) => child.attributes.productId) || [],
          parentIds: [],
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        productMap.set(product.id, product);
      }
      
      if (treeNode.children) {
        treeNode.children.forEach((child: any) => extractAllProducts(child, productMap));
      }
    };

    const productMap = new Map<string, Product>();
    extractAllProducts(tree, productMap);
    setAllProducts(productMap);
  }, [tree, currentOrganizationId]);

  const handleEditModeToggle = () => {
    if (isEditMode) {
      // Exiting edit mode
      setIsEditMode(false);
      setShowEditPanel(false);
      setEditAction(null);
      setSelectedNodeForEdit(null);
    } else {
      // Entering edit mode
      setIsEditMode(true);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedNodeForEdit(product);
    setEditAction('edit');
    setShowEditPanel(true);
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (onSaveProduct) {
      onSaveProduct(productData);
    }
    // Refresh the tree or products list here if needed
  };

  // Custom node component for the tree
  const renderCustomNodeElement = ({ nodeDatum, hierarchyPointNode }: CustomNodeElementProps) => {
    return (
      <EditableCustomTreeNode 
        nodeDatum={nodeDatum} 
        hierarchyPointNode={hierarchyPointNode} 
        hierarchicalProducts={[]} 
        allProducts={allProducts} 
        selectedProduct={selectedProduct} 
        currentOrganizationId={currentOrganizationId} 
        setSelectedProduct={setSelectedProduct} 
        arrow={arrowOrientation} 
      />
    );
  };

  return (
    <div className="h-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Root Product Selector - Only show in multi-product mode */}
        {!singleProductMode && rootProducts.length > 1 && (
          <Select value={selectedRootProductId} onValueChange={setSelectedRootProductId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select root product">
                {currentRootProduct?.name || 'Select a product'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {rootProducts.map((product: Product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Edit Mode Toggle - only show if not externally controlled */}
        {!externalEditMode && (
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={handleEditModeToggle}
            className="ml-auto"
          >
            {isEditMode ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Mode
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex h-full">
        {/* Tree visualization */}
        <div 
          ref={treeContainerRef} 
          className={`${isPanelCollapsed || showEditPanel ? 'flex-1' : 'flex-1'} border rounded-lg bg-white shadow-sm`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p>Loading tree...</p>
              </div>
            </div>
          ) : tree ? (
            <div className="h-full">
              <Tree
                key={`${viewType}-tree-${tree?.attributes?.productId || 'root'}`}
                data={treeData}
                renderCustomNodeElement={renderCustomNodeElement}
                {...DEFAULT_TREE_CONFIG}
              />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p>Error loading tree data</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No tree data available</p>
            </div>
          )}
        </div>

        {/* Product details panel - show editable panel in edit mode, regular panel otherwise */}
        {showEditPanel ? (
          <EditableProductDetailsPanel
            currentOrganizationId={currentOrganizationId}
            onSave={handleSaveProduct}
            onProductCreated={onProductCreated}
            onProductUpdated={onProductUpdated}
          />
        ) : (
          <ProductDetailsPanel
            selectedProduct={selectedProduct}
            onEdit={handleEditProduct}
            onDelete={onDelete}
            onUpdate={onUpdate}
            currentOrganizationId={currentOrganizationId}
            viewType={viewType}
            isCollapsed={isPanelCollapsed}
            onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
          />
        )}
      </div>
    </div>
  );
};

// Main component with TreeEditProvider wrapper
const EnhancedTreeView = (props: EnhancedTreeViewProps) => {
  return (
    <TreeEditProvider>
      <EnhancedTreeViewInner {...props} />
    </TreeEditProvider>
  );
};

export default EnhancedTreeView;
