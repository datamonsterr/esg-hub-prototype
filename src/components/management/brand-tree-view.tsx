"use client"

import { useGetBrandTree } from '@/src/api/product';
import { Product, ProductNode } from '@/src/types';
import { Package } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Tree, { CustomNodeElementProps } from 'react-d3-tree';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import CustomTreeNode, { ArrowOrientationType } from './custom-tree-node';
import ProductDetailsPanel from './product-details-panel';
import { ViewType } from './product-tree-view';
import { BRAND_TREE_CONFIG } from './tree-config';

interface BrandTreeViewProps {
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

const BrandTreeView = ({
  products,
  onEdit,
  onDelete,
  onUpdate,
  selectedProductId,
  singleProductMode = false,
  currentOrganizationId,
}: BrandTreeViewProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRootProductId, setSelectedRootProductId] = useState<string>('');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Track container dimensions for dynamic tree fitting
  useEffect(() => {
    const updateDimensions = () => {
      if (treeContainerRef.current) {
        const { width, height } = treeContainerRef.current.getBoundingClientRect();
        setContainerDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isPanelCollapsed]);

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

  // Find root products for brand view (components that are used by other products)
  const rootProducts = useMemo(() => {
    // For brand view, we want to find components that are used by other products
    // These are products that appear in other products' parent_ids arrays
    const usedProducts = new Set<string>();
    
    // Find all products that are referenced as parents
    products.forEach(product => {
      if (product.parentIds && product.parentIds.length > 0) {
        product.parentIds.forEach(parentId => {
          usedProducts.add(parentId);
        });
      }
    });

    // Filter products to only those that are used as components/materials
    const result = products.filter(p => usedProducts.has(p.id));

    // If no products are used as components, use all products as potential roots
    if (result.length === 0) {
      return products;
    }

    return result;
  }, [products]);

  // Get the currently selected root product for display
  const currentRootProduct = useMemo(() => {
    // In single product mode, just use the first product
    if (singleProductMode && products.length > 0) {
      return products[0];
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

  // Fetch brand tree data using the new API
  const { brandTree, isLoading: isTreeLoading, isError } = useGetBrandTree(
    currentRootProduct?.id || ''
  );

  // Convert API response to react-d3-tree format
  const treeData = useMemo(() => {
    if (!brandTree) return [];
    return [brandTree];
  }, [brandTree]);

  // Create a map of all products for node rendering (from the tree structure)
  const allProducts = useMemo(() => {
    const productMap = new Map(products.map(p => [p.id, p]));
    
    // Also add any products from the tree that might not be in the initial products list
    const addProductsFromTree = (node: any) => {
      if (node.attributes?.productId) {
        // Convert tree node back to Product format for compatibility
        const product: Product = {
          id: node.attributes.productId,
          name: node.name,
          sku: node.attributes.sku || '',
          type: node.attributes.type || 'component',
          category: node.attributes.category || '',
          description: node.attributes.description || '',
          quantity: node.attributes.quantity || 0,
          unit: node.attributes.unit || '',
          status: node.attributes.status || 'active',
          organizationId: currentOrganizationId || '',
          dataCompleteness: 50,
          missingDataFields: [],
          parentIds: [],
          childrenIds: [],
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        productMap.set(product.id, product);
      }
      
      if (node.children) {
        node.children.forEach(addProductsFromTree);
      }
    };

    if (brandTree) {
      addProductsFromTree(brandTree);
    }

    return productMap;
  }, [products, brandTree, currentOrganizationId]);

  // Create hierarchical products for backward compatibility
  const hierarchicalProducts = useMemo(() => {
    return Array.from(allProducts.values()).map(product => ({
      ...product,
      children: [],
      parents: []
    }));
  }, [allProducts]);

  // Custom node component for the tree (flows upward from component to final products)
  const renderCustomNodeElement = ({ nodeDatum, hierarchyPointNode }: CustomNodeElementProps) => {
    return <CustomTreeNode nodeDatum={nodeDatum} hierarchyPointNode={hierarchyPointNode} hierarchicalProducts={hierarchicalProducts} allProducts={allProducts} selectedProduct={selectedProduct} currentOrganizationId={currentOrganizationId} setSelectedProduct={setSelectedProduct} arrow={ArrowOrientationType.RIGHT_TO_LEFT} />
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
        <div ref={treeContainerRef} className={`${isPanelCollapsed ? 'flex-1' : 'flex-1'} border rounded-lg bg-white shadow-sm`}>
          {isTreeLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading product hierarchy...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <p>Error loading brand tree</p>
              </div>
            </div>
          ) : currentRootProduct ? (
            <div className="h-full">
              <Tree
                {...BRAND_TREE_CONFIG}
                key={`brand-tree-${currentRootProduct?.id || 'root'}`}
                data={treeData}
                renderCustomNodeElement={renderCustomNodeElement}
              />
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
          viewType={ViewType.BRAND}
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
        />
      </div>
    </div>
  );
};

export default BrandTreeView;
