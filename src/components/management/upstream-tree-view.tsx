"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Product, ProductNode } from '@/src/types';
import { getProductById } from '@/src/api/product';
import { Package, Box } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Tree, { CustomNodeElementProps } from 'react-d3-tree';
import ProductDetailsPanel from './product-details-panel';
import { UPSTREAM_TREE_CONFIG, calculateDynamicTreeConfig } from './tree-config';
import { CustomElement } from 'react-hook-form';

interface UpstreamTreeViewProps {
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

const UpstreamTreeView = ({ 
  products, 
  onEdit, 
  onDelete,
  onUpdate,
  selectedProductId, 
  singleProductMode = false, 
  currentOrganizationId 
}: UpstreamTreeViewProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRootProductId, setSelectedRootProductId] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Map<string, Product>>(new Map());
  const [hierarchicalProducts, setHierarchicalProducts] = useState<ProductNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Initialize with the provided products
  useEffect(() => {
    const productMap = new Map(products.map(p => [p.id, p]));
    setAllProducts(productMap);
  }, [products]);

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

  // Fetch only direct parent products (1 tier) for upstream view
  const fetchDirectParents = useCallback(async (product: Product): Promise<ProductNode> => {
    const parents: ProductNode[] = [];
    
    // Fetch direct parents only (depth = 1) using parent_ids
    if (product.parentIds && product.parentIds.length > 0) {
      
      
      for (const parentId of product.parentIds) {
        try {
          let parentProduct = allProducts.get(parentId);
          
          if (!parentProduct) {
            try {
              
              parentProduct = await getProductById(parentId);
              setAllProducts(prev => new Map(prev.set(parentId, parentProduct!)));
              
            } catch (fetchError) {
              console.warn(`Parent product ${parentId} not found or not accessible:`, fetchError);
              continue;
            }
          } else {
            
          }
          
          if (parentProduct) {
            // For upstream view, we only need direct parents - no recursive fetching
            const parentNode: ProductNode = {
              ...parentProduct,
              children: [], // No further children needed for display
              parents: [] // No recursive parent fetching
            };
            parents.push(parentNode);
            
          }
        } catch (error) {
          console.warn(`Failed to fetch parent product ${parentId}:`, error);
        }
      }
    } else {
      
    }

    const result = { ...product, children: [], parents };
    
    return result;
  }, [allProducts]);

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
            const productWithRelations = await fetchDirectParents(product);
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
  }, [products, fetchDirectParents, hierarchicalProducts]);

  // Find root products for upstream view (components that supply to other products)
  const rootProducts = useMemo(() => {
    
    
    // For upstream supplier perspective, find products that have parentIds
    // These are products that are supplied to other products (have parents/customers)
    const result = hierarchicalProducts.filter(p => 
      p.parentIds && p.parentIds.length > 0 // Products that are supplied to other products
    );
    
    // If no products with parentIds found, use all products as potential roots
    if (result.length === 0) {
      
      return hierarchicalProducts;
    }
    
    
    return result;
  }, [hierarchicalProducts]);  // Get the currently selected root product for display
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

  // Convert current root product to react-d3-tree format (supplier perspective)
  const treeData = useMemo(() => {
    if (!currentRootProduct) return [];

    // For upstream view from supplier perspective:
    // - Component (Shoe Laces) is at the bottom (root)
    // - Final products that use this component (Nike Running Shoe) appear above as children
    
    const convertToTreeNode = (product: ProductNode): TreeNode => {
      // Use the parents that were fetched by fetchDirectParents
      const parentProducts = product.parents || [];
      
      
      if (parentProducts.length > 0) {
        
      }
      
      return {
        name: product.name,
        attributes: { 
          productId: product.id,
          sku: product.sku,
          type: product.type 
        },
        children: parentProducts.length > 0 ? parentProducts.map(convertToTreeNode) : undefined
      };
    };

    const result = [convertToTreeNode(currentRootProduct)];
    
    return result;
  }, [currentRootProduct]);

  // Calculate tree depth for dynamic configuration
  const treeDepth = useMemo(() => {
    if (!treeData.length) return 1;
    
    const calculateDepth = (node: TreeNode): number => {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(calculateDepth));
    };
    
    return calculateDepth(treeData[0]);
  }, [treeData]);

  // Calculate total node count for dynamic configuration
  const nodeCount = useMemo(() => {
    if (!treeData.length) return 1;
    
    const countNodes = (node: TreeNode): number => {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
    };
    
    return countNodes(treeData[0]);
  }, [treeData]);

  // Dynamic tree configuration
  const dynamicTreeConfig = useMemo(() => {
    const dynamicConfig = calculateDynamicTreeConfig(
      containerDimensions.width,
      containerDimensions.height,
      treeDepth,
      nodeCount
    );
    
    return {
      ...UPSTREAM_TREE_CONFIG,
      ...dynamicConfig,
    };
  }, [containerDimensions, treeDepth, nodeCount]);

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
    const radius = 20;
    const triangleSize = 5;

    return (
      <g>
        {/* Draw arrow head to the left (pointing right) for horizontal orientation, but not for root node */}
        {!isRootNode && (
          <g>
            {/* Arrow head only - positioned to the left of the node */}
            <polygon
              points={`${-1.5*triangleSize},${triangleSize} ${-1.5*triangleSize},${-triangleSize} 0,0`}
              transform={`translate(${-radius}, 0)`}
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
          x={-35}
          y={40}
          style={{ fontSize: '12px', fontWeight: 'bold' }}
        >
          {product.name}
        </text>
        <text
          fill={isExternalProduct ? "#92400e" : "#6b7280"}
          strokeWidth="0"
          x={-35}
          y={55}
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
        <div ref={treeContainerRef} className={`${isPanelCollapsed ? 'flex-1' : 'flex-1'} border rounded-lg bg-white shadow-sm`}>
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
                key={`upstream-tree-${currentRootProduct?.id || 'root'}`}
                data={treeData}
                renderCustomNodeElement={renderCustomNodeElement}
                {...dynamicTreeConfig}
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
          viewType="upstream"
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
        />
      </div>
    </div>
  );
};

export default UpstreamTreeView;
