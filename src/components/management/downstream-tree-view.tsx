"use client"

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, ProductNode } from '@/src/types';
import { getProductById } from '@/src/api/product';
import { Package, Box } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Tree, { CustomNodeElementProps } from 'react-d3-tree';
import ProductDetailsPanel from './product-details-panel';
import { DOWNSTREAM_TREE_CONFIG } from './tree-config';

interface DownstreamTreeViewProps {
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

const DownstreamTreeView = ({ 
  products, 
  onEdit, 
  onDelete,
  onUpdate,
  selectedProductId, 
  singleProductMode = false, 
  currentOrganizationId 
}: DownstreamTreeViewProps) => {
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

  // Recursively fetch children products for downstream view
  const fetchChildrenRecursively = useCallback(async (product: Product, visited = new Set<string>()): Promise<ProductNode> => {
    // Prevent infinite loops
    if (visited.has(product.id)) {
      return { ...product, children: [], parents: [] };
    }
    visited.add(product.id);
    
    // Check if we've already processed this product
    const existingNode = hierarchicalProducts.find(p => p.id === product.id);
    if (existingNode && existingNode.children.length > 0) {
      return existingNode;
    }

    const children: ProductNode[] = [];
    
    if (product.childrenIds && product.childrenIds.length > 0) {
      // Fetch children for downstream view (what this product is made of)
      for (const childId of product.childrenIds) {
        try {
          let childProduct = allProducts.get(childId);
          
          if (!childProduct) {
            try {
              childProduct = await getProductById(childId);
              setAllProducts(prev => new Map(prev.set(childId, childProduct!)));
            } catch (fetchError) {
              console.warn(`Child product ${childId} not found or not accessible:`, fetchError);
              continue;
            }
          }
          
          if (childProduct) {
            const childWithChildren = await fetchChildrenRecursively(childProduct, new Set(visited));
            children.push(childWithChildren);
          }
        } catch (error) {
          console.warn(`Failed to fetch child product ${childId}:`, error);
        }
      }
    }

    const result = { ...product, children, parents: [] };
    
    return result;
  }, [allProducts, hierarchicalProducts]);

  // Build hierarchical structure with API calls
  useEffect(() => {
    const buildHierarchy = async () => {
      if (products.length === 0) return;
      
      // Skip rebuild if products haven't changed and we already have hierarchical data
      if (hierarchicalProducts.length > 0 && 
          products.length === hierarchicalProducts.length &&
          products.every(p => hierarchicalProducts.some(hp => hp.id === p.id))) {
        return;
      }
      
      setIsLoading(true);
      try {
        const hierarchicalProductsList: ProductNode[] = [];
        
        for (const product of products) {
          try {
            const productWithRelations = await fetchChildrenRecursively(product);
            hierarchicalProductsList.push(productWithRelations);
          } catch (error) {
            console.warn(`Failed to build hierarchy for product ${product.name} (${product.id}):`, error);
            hierarchicalProductsList.push({ ...product, children: [], parents: [] });
          }
        }
        
        setHierarchicalProducts(hierarchicalProductsList);
      } catch (error) {
        console.error('Error building hierarchy:', error);
        setHierarchicalProducts(products.map(p => ({ ...p, children: [], parents: [] })));
      } finally {
        setIsLoading(false);
      }
    };

    buildHierarchy();
  }, [products, fetchChildrenRecursively, hierarchicalProducts]);

  // Find root products for downstream view (final products or standalone)
  const rootProducts = useMemo(() => {
    
    
    // For downstream view, find products that aren't children of any other product (final products)
    // OR standalone products with no relationships
    const allChildIds = new Set(
      products.flatMap(p => p.childrenIds || [])
    );
    const result = hierarchicalProducts.filter(p => 
      !allChildIds.has(p.id) || // Not a child of any product
      ((!p.parentIds || p.parentIds.length === 0) && (!p.childrenIds || p.childrenIds.length === 0)) // Standalone product
    );
    
    return result;
  }, [hierarchicalProducts, products]);

  // Get the currently selected root product for display
  const currentRootProduct = useMemo(() => {
    // In single product mode, just use the first product
    if (singleProductMode && products.length > 0) {
      return hierarchicalProducts.find(p => p.id === products[0].id) || null;
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
  }, [rootProducts, selectedRootProductId, selectedProductId, singleProductMode, products, hierarchicalProducts]);

  // Convert current root product to react-d3-tree format
  const treeData = useMemo(() => {
    if (!currentRootProduct) return [];

    const convertToTreeNode = (product: ProductNode): TreeNode => {
      
      
      return {
        name: product.name,
        attributes: { 
          productId: product.id,
          sku: product.sku,
          type: product.type 
        },
        children: product.children.length > 0 ? product.children.map(convertToTreeNode) : undefined
      };
    };

    const result = [convertToTreeNode(currentRootProduct)];
    
    return result;
  }, [currentRootProduct]);

  // Custom node component for the tree
  const renderCustomNodeElement = ({ nodeDatum, hierarchyPointNode }: CustomNodeElementProps) => {
    const productId = nodeDatum.attributes?.productId;
    const product = hierarchicalProducts.find(p => p.id === productId) || 
                   Array.from(allProducts.values()).find(p => p.id === productId);
    
    if (!product) return <div />;

    const isSelected = selectedProduct?.id === product.id;
    const isExternalProduct = currentOrganizationId ? 
      product.organizationId !== currentOrganizationId : 
      false;

    // Check if this is the root node (no parent)
    const isRootNode = !hierarchyPointNode.parent;
    const isLeafNode = hierarchyPointNode.children?.length === 0 || hierarchyPointNode.children === undefined;
    const radius = 20;
    const triangleSize = 5;
    
    console.log(`Rendering node for product ${product.name} (ID: ${product.id}) - Selected: ${isSelected}, External: ${isExternalProduct}, Root: ${isRootNode}`);
    console.log(`Hierarchy Point Node:`, hierarchyPointNode);

    return (
      <g>
        {/* Draw arrow head above the node (pointing down) for vertical orientation, but not for root node */}
        {!isLeafNode && (
          <g>
            {/* Arrow head only - positioned above the node */}
            <polygon
              points={`${-triangleSize},${1.5*triangleSize}
                      0,0
                      ${triangleSize},${1.5*triangleSize}`}
              transform={`translate(0, ${radius})`}
              fill="#6b7280"
            />
          </g>
        )}
        
        <circle
          r={radius}
          fill={isExternalProduct ? "#fef3c7" : "#e5e7eb"}
          stroke={isSelected ? "#22c55e" : isExternalProduct ? "#f59e0b" : product.type === 'final_product' ? "#059669" : "#6b7280"}
          strokeWidth={isSelected ? 4 : isExternalProduct ? 3 : 2}
          onClick={() => setSelectedProduct(product)}
          style={{ cursor: 'pointer' }}
        />
        {product.type === 'final_product' ? (
          <Package size={16} x={-8} y={-8} className={isExternalProduct ? "text-amber-700" : "text-gray-700"} />
        ) : (
          <Box size={14} x={-7} y={-7} className={isExternalProduct ? "text-amber-700" : "text-gray-600"} />
        )}
        <text
          fill={isSelected ? "black" : isExternalProduct ? "#92400e" : "black"}
          strokeWidth="0"
          x={30}
          y={5}
          style={{ fontSize: '12px', fontWeight: 'bold' }}
        >
          {product.name}
        </text>
        <text
          fill={isExternalProduct ? "#92400e" : "#6b7280"}
          strokeWidth="0"
          x={30}
          y={20}
          style={{ fontSize: '10px' }}
        >
          {product.sku || "No SKU"} • {product.type?.replace('_', ' ')} {isExternalProduct ? "• External" : ""}
        </text>
      </g>
    );
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
              {rootProducts.map((product: ProductNode) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex h-[600px]">
        {/* Tree visualization */}
        <div className={`${isPanelCollapsed ? 'flex-1' : 'flex-1'} border rounded-lg bg-white shadow-sm`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading product hierarchy...</p>
              </div>
            </div>
          ) : currentRootProduct ? (
            <div className="h-full">
              <Tree
                key={`downstream-tree-${currentRootProduct?.id || 'root'}`}
                data={treeData}
                renderCustomNodeElement={renderCustomNodeElement}
                {...DOWNSTREAM_TREE_CONFIG}
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
          viewType="downstream"
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
        />
      </div>
    </div>
  );
};

export default DownstreamTreeView;
