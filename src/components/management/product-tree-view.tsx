"use client"

import { useState, useMemo, useEffect } from 'react';
import { Product, ProductNode } from '@/src/types';
import { getProductById } from '@/src/api/product';
import { Package, Box, ShieldCheck, MapPin, TrendingUp, Info, Edit, Trash2, ChevronDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Tree from 'react-d3-tree';

interface ProductTreeViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

interface TreeNode {
  name: string;
  attributes?: Record<string, any>;
  children?: TreeNode[];
}

const ProductTreeView = ({ products, onEdit, onDelete }: ProductTreeViewProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRootProductId, setSelectedRootProductId] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Map<string, Product>>(new Map());
  const [hierarchicalProducts, setHierarchicalProducts] = useState<ProductNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with the provided products
  useEffect(() => {
    const productMap = new Map(products.map(p => [p.id, p]));
    setAllProducts(productMap);
  }, [products]);

  // Recursively fetch children products
  const fetchChildrenRecursively = async (product: Product, visited = new Set<string>()): Promise<ProductNode> => {
    // Prevent infinite loops
    if (visited.has(product.id)) {
      return { ...product, children: [] };
    }
    visited.add(product.id);

    const children: ProductNode[] = [];
    
    if (product.childrenIds && product.childrenIds.length > 0) {
      for (const childId of product.childrenIds) {
        try {
          // Check if we already have this product
          let childProduct = allProducts.get(childId);
          
          if (!childProduct) {
            // Fetch the child product from API
            childProduct = await getProductById(childId);
            // Update our local cache
            setAllProducts(prev => new Map(prev.set(childId, childProduct!)));
          }
          
          if (childProduct) {
            // Recursively fetch this child's children
            const childWithChildren = await fetchChildrenRecursively(childProduct, new Set(visited));
            children.push(childWithChildren);
          }
        } catch (error) {
          console.warn(`Failed to fetch child product ${childId}:`, error);
        }
      }
    }

    return { ...product, children };
  };

  // Build hierarchical structure with API calls
  useEffect(() => {
    const buildHierarchy = async () => {
      if (products.length === 0) return;
      
      setIsLoading(true);
      try {
        const hierarchicalProductsList: ProductNode[] = [];
        
        for (const product of products) {
          const productWithChildren = await fetchChildrenRecursively(product);
          hierarchicalProductsList.push(productWithChildren);
        }
        
        setHierarchicalProducts(hierarchicalProductsList);
      } catch (error) {
        console.error('Error building hierarchy:', error);
        setHierarchicalProducts(products.map(p => ({ ...p, children: [] })));
      } finally {
        setIsLoading(false);
      }
    };

    buildHierarchy();
  }, [products, allProducts]);

  // Find root products (those that aren't children of any other product)
  const rootProducts = useMemo(() => {
    const allChildIds = new Set(
      products.flatMap(p => p.childrenIds || [])
    );
    return hierarchicalProducts.filter(p => !allChildIds.has(p.id));
  }, [hierarchicalProducts, products]);

  // Get the currently selected root product for display
  const currentRootProduct = useMemo(() => {
    if (selectedRootProductId) {
      return rootProducts.find(p => p.id === selectedRootProductId);
    }
    return rootProducts[0] || null;
  }, [rootProducts, selectedRootProductId]);

  // Convert current root product to react-d3-tree format
  const treeData = useMemo(() => {
    if (!currentRootProduct) return [];

    const convertToTreeNode = (product: ProductNode): TreeNode => ({
      name: product.name,
      attributes: { 
        productId: product.id,
        sku: product.sku,
        type: product.type 
      },
      children: product.children?.map(convertToTreeNode) || []
    });

    return [convertToTreeNode(currentRootProduct)];
  }, [currentRootProduct]);

  // Custom node component for the tree
  const renderCustomNodeElement = ({ nodeDatum }: any) => {
    const productId = nodeDatum.attributes?.productId;
    const product = hierarchicalProducts.find(p => p.id === productId) || 
                   Array.from(allProducts.values()).find(p => p.id === productId);
    
    if (!product) return <div />;

    const isSelected = selectedProduct?.id === product.id;

    return (
      <g>
        <circle
          r={20}
          fill={isSelected ? "#3b82f6" : "#e5e7eb"}
          stroke={product.type === 'final_product' ? "#059669" : "#6b7280"}
          strokeWidth={2}
          onClick={() => setSelectedProduct(product)}
          style={{ cursor: 'pointer' }}
        />
        {product.type === 'final_product' ? (
          <Package size={16} x={-8} y={-8} className="text-gray-700" />
        ) : (
          <Box size={14} x={-7} y={-7} className="text-gray-600" />
        )}
        <text
          fill={isSelected ? "white" : "black"}
          strokeWidth="0"
          x={30}
          y={5}
          style={{ fontSize: '12px', fontWeight: 'bold' }}
        >
          {product.name}
        </text>
        <text
          fill="#6b7280"
          strokeWidth="0"
          x={30}
          y={20}
          style={{ fontSize: '10px' }}
        >
          {product.sku} • {product.type?.replace('_', ' ')}
        </text>
      </g>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Tree View</CardTitle>
          {rootProducts.length > 1 && (
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
                  data={treeData}
                  orientation="vertical"
                  translate={{ x: 400, y: 100 }}
                  renderCustomNodeElement={renderCustomNodeElement}
                  nodeSize={{ x: 200, y: 100 }}
                  separation={{ siblings: 1.5, nonSiblings: 2 }}
                  collapsible={true}
                  initialDepth={2}
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
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(selectedProduct)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(selectedProduct)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

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
                    <h4 className="font-medium text-sm mb-2">Components ({selectedProduct.children.length})</h4>
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
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductTreeView; 