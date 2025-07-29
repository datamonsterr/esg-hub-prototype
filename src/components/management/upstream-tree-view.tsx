"use client"

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, ProductNode } from '@/src/types';
import { getProductById } from '@/src/api/product';
import { Package, Box } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Tree from 'react-d3-tree';
import ProductDetailsPanel from './product-details-panel';
import { UPSTREAM_TREE_CONFIG } from './tree-config';

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

  // Recursively fetch parent products for upstream view
  const fetchParentsRecursively = useCallback(async (product: Product, visited = new Set<string>()): Promise<ProductNode> => {
    // Prevent infinite loops
    if (visited.has(product.id)) {
      return { ...product, children: [], parents: [] };
    }
    visited.add(product.id);
    
    // Check if we've already processed this product
    const existingNode = hierarchicalProducts.find(p => p.id === product.id);
    if (existingNode && existingNode.parents && existingNode.parents.length > 0) {
      return existingNode;
    }

    const parents: ProductNode[] = [];
    
    // For upstream view, in single product mode we use the parentIds directly
    if (singleProductMode && product.parentIds && product.parentIds.length > 0) {
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
          }
          
          if (parentProduct && !visited.has(parentProduct.id)) {
            const parentWithParents = await fetchParentsRecursively(parentProduct, new Set(visited));
            parents.push(parentWithParents);
          }
        } catch (error) {
          console.warn(`Failed to fetch parent product ${parentId}:`, error);
        }
      }
    } else {
      // For non-single product mode, look through all products for ones that have this product in their childrenIds
      console.log(`Looking for products that use ${product.name} (${product.id}) as a component`);
      for (const otherProduct of products) {
        if (otherProduct.childrenIds && otherProduct.childrenIds.includes(product.id)) {
          console.log(`Found that ${otherProduct.name} uses ${product.name}`);
          try {
            let parentProduct = allProducts.get(otherProduct.id);
            if (!parentProduct) {
              parentProduct = otherProduct;
              setAllProducts(prev => new Map(prev.set(otherProduct.id, parentProduct!)));
            }
            
            if (parentProduct && !visited.has(parentProduct.id)) {
              const parentWithParents = await fetchParentsRecursively(parentProduct, new Set(visited));
              parents.push(parentWithParents);
            }
          } catch (error) {
            console.warn(`Failed to process parent product ${otherProduct.id}:`, error);
          }
        }
      }
    }

    const result = { ...product, children: [], parents };
    console.log(`Product ${product.name} - Parents: ${parents.length}`);
    return result;
  }, [allProducts, hierarchicalProducts, singleProductMode, products]);

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
            const productWithRelations = await fetchParentsRecursively(product);
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
  }, [products, fetchParentsRecursively, hierarchicalProducts]);

  // Find root products for upstream view (components/materials or standalone)
  const rootProducts = useMemo(() => {
    console.log('Finding root products for upstream view');
    
    // For upstream view, find products that are components/materials (appear in childrenIds of other products)
    // OR products that have no parents (to show standalone components)
    const allChildIds = new Set(
      products.flatMap(p => p.childrenIds || [])
    );
    // Include products that are referenced as children OR have no parent relationships OR standalone products
    const result = hierarchicalProducts.filter(p => 
      allChildIds.has(p.id) || // Used as a component
      (!p.parentIds || p.parentIds.length === 0) || // No parents
      ((!p.parentIds || p.parentIds.length === 0) && (!p.childrenIds || p.childrenIds.length === 0)) // Standalone product
    );
    console.log('Upstream root products (components/materials or standalone):', result.map(p => p.name));
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
      const relatedProducts = product.parents || [];
      console.log(`Converting ${product.name} to tree node. Parents: ${relatedProducts.length}`);
      
      return {
        name: product.name,
        attributes: { 
          productId: product.id,
          sku: product.sku,
          type: product.type 
        },
        children: relatedProducts.length > 0 ? relatedProducts.map(convertToTreeNode) : undefined
      };
    };

    const result = [convertToTreeNode(currentRootProduct)];
    console.log('Upstream tree data generated:', result);
    return result;
  }, [currentRootProduct]);

  // Custom node component for the tree
  const renderCustomNodeElement = ({ nodeDatum }: any) => {
    const productId = nodeDatum.attributes?.productId;
    const product = hierarchicalProducts.find(p => p.id === productId) || 
                   Array.from(allProducts.values()).find(p => p.id === productId);
    
    if (!product) return <div />;

    const isSelected = selectedProduct?.id === product.id;
    const isExternalProduct = currentOrganizationId ? 
      product.organizationId !== currentOrganizationId : 
      false;

    return (
      <g>
        <circle
          r={20}
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
                key={`upstream-tree-${currentRootProduct?.id || 'root'}`}
                data={treeData}
                renderCustomNodeElement={renderCustomNodeElement}
                {...UPSTREAM_TREE_CONFIG}
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
