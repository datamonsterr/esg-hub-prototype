"use client"

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, ProductNode } from '@/src/types';
import { useGetSupplierTree } from '@/src/api/product';
import { Package, Box } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Tree, { CustomNodeElementProps } from 'react-d3-tree';
import ProductDetailsPanel from './product-details-panel';
import { SUPPLIER_TREE_CONFIG } from './tree-config';
import { ViewType } from './product-tree-view';
import CustomTreeNode, { ArrowOrientationType } from './custom-tree-node';

interface SupplierTreeViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdate?: (product: Product) => void;
  selectedProductId?: string;
  singleProductMode?: boolean;
  currentOrganizationId?: string;
}

interface TreeNode {
  name: string;
  attributes?: Record<string, any>;
  children?: TreeNode[];
}

const SupplierTreeView = ({ 
  products, 
  onEdit, 
  onDelete,
  onUpdate,
  selectedProductId, 
  singleProductMode = false, 
  currentOrganizationId 
}: SupplierTreeViewProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRootProductId, setSelectedRootProductId] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Map<string, Product>>(new Map());
  const [hierarchicalProducts, setHierarchicalProducts] = useState<ProductNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Initialize with the provided products
  useEffect(() => {
    const productMap = new Map(products.map(p => [p.id, p]));
    setAllProducts(productMap);
  }, [products]);

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

  // Find root products for supplier view (final products or standalone)
  const rootProducts = useMemo(() => {
    // For supplier view, find products that aren't children of any other product (final products)
    // OR standalone products with no relationships
    const allChildIds = new Set(
      products.flatMap(p => p.childrenIds || [])
    );
    const result = products.filter(p => 
      !allChildIds.has(p.id) || // Not a child of any product
      ((!p.parentIds || p.parentIds.length === 0) && (!p.childrenIds || p.childrenIds.length === 0)) // Standalone product
    );
    
    return result;
  }, [products]);

  // Get the currently selected root product for display
  const currentRootProduct = useMemo(() => {
    // In single product mode, just use the first product
    if (singleProductMode && products.length > 0) {
      return products[0] || null;
    }
    
    // Otherwise, use selection logic
    if (selectedRootProductId) {
      const explicitSelection = rootProducts.find(p => p.id === selectedRootProductId);
      if (explicitSelection) return explicitSelection;
    }
    
    // If we have a selectedProductId, try to use it if it's in rootProducts
    if (selectedProductId) {
      const targetProduct = rootProducts.find(p => p.id === selectedProductId);
      if (targetProduct) return targetProduct;
    }
    
    return rootProducts[0] || null;
  }, [rootProducts, selectedRootProductId, selectedProductId, singleProductMode, products]);

  // Use the supplier tree hook to fetch recursive hierarchy
  const { 
    supplierTree, 
    isLoading: isTreeLoading, 
    isError: isTreeError 
  } = useGetSupplierTree(currentRootProduct?.id || '');

  // Set loading state based on tree loading
  useEffect(() => {
    setIsLoading(isTreeLoading);
  }, [isTreeLoading]);

  // Convert supplier tree to react-d3-tree format (already compatible)
  const treeData = useMemo(() => {
    if (!supplierTree) return [];
    // The supplierTree is already in react-d3-tree format from the server
    return [supplierTree];
  }, [supplierTree]);

  // Build allProducts map from the supplier tree for the CustomTreeNode component
  useEffect(() => {
    if (!supplierTree) return;

    const extractAllProducts = (treeNode: any, productMap: Map<string, Product>) => {
      if (treeNode.attributes) {
        // Convert tree node back to Product format for CustomTreeNode compatibility
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
    extractAllProducts(supplierTree, productMap);
    setAllProducts(productMap);
  }, [supplierTree, currentOrganizationId]);

  // Custom node component for the tree
  const renderCustomNodeElement = ({ nodeDatum, hierarchyPointNode }: CustomNodeElementProps) => {
    return <CustomTreeNode 
      nodeDatum={nodeDatum} 
      hierarchyPointNode={hierarchyPointNode} 
      hierarchicalProducts={[]} // Empty array since we're using allProducts for product lookup
      allProducts={allProducts} 
      selectedProduct={selectedProduct} 
      currentOrganizationId={currentOrganizationId} 
      setSelectedProduct={setSelectedProduct} 
      arrow={ArrowOrientationType.LEFT_TO_RIGHT} 
    />
  };

  return (
    <div className="h-full">
      {/* Root Product Selector - Only show in multi-product mode */}
      {!singleProductMode && rootProducts.length > 1 && (
        <div className="mb-4">
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
        </div>
      )}

      <div className="flex h-full">
        {/* Tree visualization */}
        <div className={`${isPanelCollapsed ? 'flex-1' : 'flex-1'} border rounded-lg bg-white shadow-sm`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading product hierarchy...</p>
              </div>
            </div>
          ) : supplierTree ? (
            <div className="h-full">
              <Tree
                key={`supplier-tree-${supplierTree?.attributes?.productId || 'root'}`}
                data={treeData}
                renderCustomNodeElement={renderCustomNodeElement}
                {...SUPPLIER_TREE_CONFIG}
              />
            </div>
          ) : isTreeError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <p>Failed to load product tree</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No products available to display</p>
              </div>
            </div>
          )}
        </div>

        {/* Product details panel */}
        <ProductDetailsPanel
          selectedProduct={selectedProduct}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdate={onUpdate}
          currentOrganizationId={currentOrganizationId}
          viewType={ViewType.SUPPLIER}
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
        />
      </div>
    </div>
  );
};

export default SupplierTreeView;
