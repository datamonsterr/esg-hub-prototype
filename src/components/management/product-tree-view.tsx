"use client"

import { useState, useMemo, useEffect } from 'react';
import { Product, ProductNode } from '@/src/types';
import { getProductById } from '@/src/api/product';
import { Package, Box, ShieldCheck, MapPin, TrendingUp, Info, Edit, Trash2, ChevronDown, ArrowRight, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Tree from 'react-d3-tree';
import { useRouter } from 'next/navigation';

interface ProductTreeViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  selectedProductId?: string; // Optional prop to pre-select a specific product
  initialViewType?: 'downstream' | 'upstream'; // Make this optional with default
  singleProductMode?: boolean; // Whether to operate in single product mode (dynamic loading)
  currentOrganizationId?: string; // Current organization ID to detect external products
}

interface TreeNode {
  name: string;
  attributes?: Record<string, any>;
  children?: TreeNode[];
}

const ProductTreeView = ({ products, onEdit, onDelete, selectedProductId, initialViewType = 'downstream', singleProductMode = false, currentOrganizationId }: ProductTreeViewProps) => {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRootProductId, setSelectedRootProductId] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Map<string, Product>>(new Map());
  const [hierarchicalProducts, setHierarchicalProducts] = useState<ProductNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewType, setViewType] = useState<'downstream' | 'upstream'>(initialViewType);

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
        // Also set this as the selected root product if it becomes a root
        setSelectedRootProductId(selectedProductId);
      }
    }
  }, [selectedProductId, products]);

  // Recursively fetch children or parent products based on view type
  const fetchRelatedProductsRecursively = async (product: Product, visited = new Set<string>()): Promise<ProductNode> => {
    // Prevent infinite loops
    if (visited.has(product.id)) {
      return { ...product, children: [], parents: [] };
    }
    visited.add(product.id);
    
    // Check if we've already processed this product with this view type
    const existingNode = hierarchicalProducts.find(p => p.id === product.id);
    if (existingNode) {
      if ((viewType === 'downstream' && existingNode.children.length > 0) ||
          (viewType === 'upstream' && existingNode.parents && existingNode.parents.length > 0)) {
        return existingNode;
      }
    }

    const children: ProductNode[] = [];
    const parents: ProductNode[] = [];
    
    if (viewType === 'downstream' && product.parentIds && product.parentIds.length > 0) {
      // Fetch parents for downstream view (what this product is made of)
      for (const parentId of product.parentIds) {
        try {
          let parentProduct = allProducts.get(parentId);
          
          if (!parentProduct) {
            try {
              parentProduct = await getProductById(parentId);
              setAllProducts(prev => new Map(prev.set(parentId, parentProduct!)));
            } catch (fetchError) {
              console.warn(`Parent product ${parentId} not found or not accessible:`, fetchError);
              continue; // Skip this parent and continue with others
            }
          }
          
          if (parentProduct) {
            const parentWithChildren = await fetchRelatedProductsRecursively(parentProduct, new Set(visited));
            children.push(parentWithChildren);
          }
        } catch (error) {
          console.warn(`Failed to fetch parent product ${parentId}:`, error);
          // Continue with other parents instead of failing completely
        }
      }
    } else if (viewType === 'upstream') {
      // For upstream view, fetch immediate children (what uses this product) - don't recurse further
      if (product.childrenIds && product.childrenIds.length > 0) {
        for (const childId of product.childrenIds) {
          try {
            let childProduct = allProducts.get(childId);
            
            if (!childProduct) {
              try {
                childProduct = await getProductById(childId);
                setAllProducts(prev => new Map(prev.set(childId, childProduct!)));
              } catch (fetchError) {
                console.warn(`Child product ${childId} not found or not accessible:`, fetchError);
                continue; // Skip this child and continue with others
              }
            }
            
            if (childProduct && !visited.has(childProduct.id)) {
              // For upstream, don't recurse - just add the child as-is with empty parents array
              parents.push({ ...childProduct, children: [], parents: [] });
            }
          } catch (error) {
            console.warn(`Failed to fetch child product ${childId}:`, error);
          }
        }
      }
    }

    const result = { ...product, children, parents };
    console.log(`Product ${product.name} - Children: ${children.length}, Parents: ${parents.length}`);
    return result;
  };

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
            const productWithRelations = await fetchRelatedProductsRecursively(product);
            hierarchicalProductsList.push(productWithRelations);
          } catch (error) {
            console.warn(`Failed to build hierarchy for product ${product.name} (${product.id}):`, error);
            // Add the product without relations if there's an error
            hierarchicalProductsList.push({ ...product, children: [], parents: [] });
          }
        }
        
        setHierarchicalProducts(hierarchicalProductsList);
      } catch (error) {
        console.error('Error building hierarchy:', error);
        // Fallback: show all products without relations
        setHierarchicalProducts(products.map(p => ({ ...p, children: [], parents: [] })));
      } finally {
        setIsLoading(false);
      }
    };

    buildHierarchy();
  }, [products, viewType])

  // Find root products based on view type
  const rootProducts = useMemo(() => {
    console.log('Finding root products for viewType:', viewType);
    console.log('Hierarchical products:', hierarchicalProducts.map(p => ({ 
      name: p.name, 
      childrenIds: p.childrenIds, 
      parentIds: p.parentIds,
      children: p.children?.length || 0,
      parents: p.parents?.length || 0
    })));
    
    if (viewType === 'downstream') {
      // For downstream view, find products that aren't children of any other product (final products)
      // OR standalone products with no relationships
      const allChildIds = new Set(
        products.flatMap(p => p.childrenIds || [])
      );
      const result = hierarchicalProducts.filter(p => 
        !allChildIds.has(p.id) || // Not a child of any product
        ((!p.parentIds || p.parentIds.length === 0) && (!p.childrenIds || p.childrenIds.length === 0)) // Standalone product
      );
      console.log('Downstream root products (final products or standalone):', result.map(p => p.name));
      return result;
    } else {
      // For upstream view, find products that have children (components/materials that are used by other products)
      // OR standalone products with no relationships
      const result = hierarchicalProducts.filter(p => 
        (p.childrenIds && p.childrenIds.length > 0) || // Has children (used by other products)
        ((!p.parentIds || p.parentIds.length === 0) && (!p.childrenIds || p.childrenIds.length === 0)) // Standalone product
      );
      console.log('Upstream root products (components used by others or standalone):', result.map(p => p.name));
      return result;
    }
  }, [hierarchicalProducts, products, viewType]);

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
      const relatedProducts = viewType === 'downstream' ? product.children : product.parents || [];
      console.log(`Converting ${product.name} to tree node. ViewType: ${viewType}, Related products: ${relatedProducts.length}`);
      
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
    console.log('Tree data generated:', result);
    return result;
  }, [currentRootProduct, viewType]);

  // Custom node component for the tree
  const renderCustomNodeElement = ({ nodeDatum }: any) => {
    const productId = nodeDatum.attributes?.productId;
    const product = hierarchicalProducts.find(p => p.id === productId) || 
                   Array.from(allProducts.values()).find(p => p.id === productId);
    
    if (!product) return <div />;

    const isSelected = selectedProduct?.id === product.id;
    const isExternalProduct = currentOrganizationId ? 
      product.organizationId !== currentOrganizationId : 
      false; // Default to internal if no org ID is provided

    return (
      <g>
        <circle
          r={20}
          fill={isSelected ? "#3b82f6" : isExternalProduct ? "#fef3c7" : "#e5e7eb"}
          stroke={isExternalProduct ? "#f59e0b" : product.type === 'final_product' ? "#059669" : "#6b7280"}
          strokeWidth={isExternalProduct ? 3 : 2}
          onClick={() => setSelectedProduct(product)}
          style={{ cursor: 'pointer' }}
        />
        {product.type === 'final_product' ? (
          <Package size={16} x={-8} y={-8} className={isExternalProduct ? "text-amber-700" : "text-gray-700"} />
        ) : (
          <Box size={14} x={-7} y={-7} className={isExternalProduct ? "text-amber-700" : "text-gray-600"} />
        )}
        <text
          fill={isSelected ? "white" : isExternalProduct ? "#92400e" : "black"}
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
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Product Tree View - {viewType === 'downstream' ? 'Downstream (What this is made of)' : 'Upstream (What uses this)'}
          </CardTitle>
          <div className="flex items-center space-x-4">
            {/* View Type Toggle */}
            <Select value={viewType} onValueChange={(value: 'downstream' | 'upstream') => {
              setViewType(value);
              setSelectedRootProductId(''); // Reset selection when changing view type
            }}>
              <SelectTrigger className="w-40">
                <SelectValue>
                  {viewType === 'downstream' ? 'Downstream' : 'Upstream'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="downstream">Downstream</SelectItem>
                <SelectItem value="upstream">Upstream</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Root Product Selector - Only show in multi-product mode */}
            {!singleProductMode && rootProducts.length > 1 && (
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
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-[600px]">
          {/* Tree visualization */}
          <div className="flex-1 border rounded-lg bg-white shadow-sm">
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
                  key={`tree-${currentRootProduct?.id || 'root'}-${viewType}`}
                  data={treeData}
                  orientation="vertical"
                  translate={{ x: 400, y: viewType === 'downstream' ? 100 : 200 }}
                  renderCustomNodeElement={renderCustomNodeElement}
                  nodeSize={{ x: 200, y: 100 }}
                  separation={{ siblings: 1.5, nonSiblings: 2 }}
                  collapsible={true}
                  initialDepth={viewType === 'downstream' ? 2 : 1}
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
          {selectedProduct && (
            <div className="w-1/3 bg-gray-50 border-l p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                {(!currentOrganizationId || selectedProduct.organizationId === currentOrganizationId) ? (
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(selectedProduct)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(selectedProduct)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : null}
              </div>

              {(!currentOrganizationId || selectedProduct.organizationId === currentOrganizationId) ? (
                <div className="space-y-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {selectedProduct.type?.replace('_', ' ') || 'product'}
                    </Badge>
                    <p className="text-sm text-gray-600">{selectedProduct.sku}</p>
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      {selectedProduct.status}
                    </span>
                  </div>
                
                {selectedProduct.description && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Description</h4>
                    <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sustainability Score</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedProduct.metadata?.sustainabilityScore || 'N/A'}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Origin Country</CardTitle>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">{selectedProduct.metadata?.originCountry || 'N/A'}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Certifications</CardTitle>
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {selectedProduct.metadata?.certifications?.map((c: string) => (
                          <Badge key={c} variant="secondary">{c}</Badge>
                        )) ?? <p className='text-sm'>N/A</p>}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Data Completeness</CardTitle>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedProduct.dataCompleteness || 'N/A'}%</div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Properties</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Quantity:</span> {selectedProduct.quantity} {selectedProduct.unit}</p>
                    <p><span className="font-medium">Category:</span> {selectedProduct.category || 'N/A'}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date(selectedProduct.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedProduct.children && selectedProduct.children.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      {viewType === 'downstream' ? 'Components' : 'Used By'} ({selectedProduct.children.length})
                    </h4>
                    <div className="space-y-1">
                      {selectedProduct.children.map((child) => (
                        <div key={child.id} className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <Box size={14} className="text-gray-600" />
                          <span className="text-sm">{child.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {child.type?.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.parents && selectedProduct.parents.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      {viewType === 'downstream' ? 'Used In' : 'Made From'} ({selectedProduct.parents.length})
                    </h4>
                    <div className="space-y-1">
                      {selectedProduct.parents.map((parent) => (
                        <div key={parent.id} className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <Package size={14} className="text-gray-600" />
                          <span className="text-sm">{parent.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {parent.type?.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-800">External Product</h3>
                        <p className="text-sm text-amber-700 mt-1">
                          This product belongs to another organization. Limited information is available.
                        </p>
                        <div className="mt-3">
                          <Button 
                            onClick={() => router.push(`/traceability/outgoing/create?productId=${selectedProduct.id}&supplierOrgId=${selectedProduct.organizationId}`)}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            Request Traceability Information
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {selectedProduct.type?.replace('_', ' ') || 'product'}
                    </Badge>
                    <p className="text-sm text-gray-600">{selectedProduct.sku || 'No SKU available'}</p>
                    <p className="mt-2 text-sm font-medium">To access detailed information about this product, send a traceability request to the supplier organization.</p>
                  </div>
                </div>
              )}

                {selectedProduct.description && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Description</h4>
                    <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sustainability Score</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedProduct.metadata?.sustainabilityScore || 'N/A'}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Origin Country</CardTitle>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">{selectedProduct.metadata?.originCountry || 'N/A'}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Certifications</CardTitle>
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {selectedProduct.metadata?.certifications?.map((c: string) => (
                          <Badge key={c} variant="secondary">{c}</Badge>
                        )) ?? <p className='text-sm'>N/A</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Data Completeness</CardTitle>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedProduct.dataCompleteness || 'N/A'}%</div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Properties</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Quantity:</span> {selectedProduct.quantity} {selectedProduct.unit}</p>
                    <p><span className="font-medium">Category:</span> {selectedProduct.category || 'N/A'}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date(selectedProduct.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedProduct.children && selectedProduct.children.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      {viewType === 'downstream' ? 'Components' : 'Used By'} ({selectedProduct.children.length})
                    </h4>
                    <div className="space-y-1">
                      {selectedProduct.children.map((child) => (
                        <div key={child.id} className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <Box size={14} className="text-gray-600" />
                          <span className="text-sm">{child.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {child.type?.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.parents && selectedProduct.parents.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      {viewType === 'downstream' ? 'Used In' : 'Made From'} ({selectedProduct.parents.length})
                    </h4>
                    <div className="space-y-1">
                      {selectedProduct.parents.map((parent) => (
                        <div key={parent.id} className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <Package size={14} className="text-gray-600" />
                          <span className="text-sm">{parent.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {parent.type?.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductTreeView; 