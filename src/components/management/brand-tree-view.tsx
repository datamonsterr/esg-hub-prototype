"use client"

import { getProductById } from '@/src/api/product';
import { Product, ProductNode } from '@/src/types';
import { Box, Package } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Tree, { CustomNodeElementProps } from 'react-d3-tree';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ProductDetailsPanel from './product-details-panel';
import { ViewType } from './product-tree-view';
import CustomTreeNode, { ArrowOrientationType } from './custom-tree-node';
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

  // Fetch only direct parent products (1 tier) for brand view
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
            // For brand view, we only need direct parents - no recursive fetching
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

  // Find root products for brand view (components that supply to other products)
  const rootProducts = useMemo(() => {


    // For brand supplier perspective, find products that have parentIds
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

    // For brand view from supplier perspective:
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

  // Custom node component for the tree
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
              {rootProducts.map((product: ProductNode) => (
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
