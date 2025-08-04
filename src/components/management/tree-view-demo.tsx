"use client"

import React, { useState } from 'react';
import { Product } from '@/src/types';
import ProductTreeView, { ViewType } from './product-tree-view';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';

// Sample product data for demonstration
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Sustainable Athletic Wear',
    sku: 'SAW-001',
    description: 'High-performance athletic wear made from sustainable materials',
    type: 'final_product',
    category: 'Apparel',
    quantity: 100,
    unit: 'pcs',
    status: 'active',
    organizationId: 'org-1',
    dataCompleteness: 85,
    missingDataFields: ['certifications'],
    parentIds: ['2', '3'],
    childrenIds: [],
    metadata: {
      material: 'Organic Cotton',
      certifications: ['GOTS', 'OEKO-TEX']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Organic Cotton Fabric',
    sku: 'OCF-001',
    description: 'GOTS certified organic cotton fabric',
    type: 'raw_material',
    category: 'Textiles',
    quantity: 50,
    unit: 'meters',
    status: 'active',
    organizationId: 'org-1',
    dataCompleteness: 95,
    missingDataFields: [],
    parentIds: ['4'],
    childrenIds: ['1'],
    metadata: {
      certification: 'GOTS',
      origin: 'India'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Recycled Polyester Thread',
    sku: 'RPT-001',
    description: 'Thread made from recycled plastic bottles',
    type: 'component',
    category: 'Textiles',
    quantity: 200,
    unit: 'spools',
    status: 'active',
    organizationId: 'org-1',
    dataCompleteness: 90,
    missingDataFields: ['origin'],
    parentIds: ['5'],
    childrenIds: ['1'],
    metadata: {
      recycledContent: 100,
      material: 'Polyester'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Cotton Seeds',
    sku: 'CS-001',
    description: 'Organic cotton seeds',
    type: 'raw_material',
    category: 'Agriculture',
    quantity: 10,
    unit: 'kg',
    status: 'active',
    organizationId: 'org-2', // External organization
    dataCompleteness: 70,
    missingDataFields: ['certifications', 'origin'],
    parentIds: [],
    childrenIds: ['2'],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Recycled Plastic Bottles',
    sku: 'RPB-001',
    description: 'Collected plastic bottles for recycling',
    type: 'raw_material',
    category: 'Recycled Materials',
    quantity: 1000,
    unit: 'bottles',
    status: 'active',
    organizationId: 'org-2', // External organization
    dataCompleteness: 60,
    missingDataFields: ['certifications', 'collection_date'],
    parentIds: [],
    childrenIds: ['3'],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface TreeViewDemoProps {
  organizationId?: string;
}

const TreeViewDemo = ({ organizationId = 'org-1' }: TreeViewDemoProps) => {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [savedProducts, setSavedProducts] = useState<Array<Partial<Product>>>([]);

  const handleEdit = (product: Product) => {
    console.log('Edit product:', product);
    // In a real app, you might navigate to an edit page or open a modal
  };

  const handleDelete = (product: Product) => {
    console.log('Delete product:', product);
    // In a real app, you would call an API to delete the product
    setProducts(prev => prev.filter(p => p.id !== product.id));
  };

  const handleUpdate = (product: Product) => {
    console.log('Update product:', product);
    // In a real app, you would call an API to update the product
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    console.log('Save product:', productData);
    
    // Add to saved products list for demonstration
    setSavedProducts(prev => [...prev, productData]);

    // In a real app, you would:
    // 1. Call an API to save the product
    // 2. Handle the response (success/error)
    // 3. Refresh the tree data
    // 4. Show success/error notifications
    
    // For demo purposes, let's simulate adding it to the products list
    if (!productData.id) {
      // New product
      const newProduct: Product = {
        id: Date.now().toString(),
        name: productData.name || 'New Product',
        sku: productData.sku || '',
        description: productData.description || '',
        type: productData.type || 'component',
        category: productData.category || '',
        quantity: productData.quantity || 1,
        unit: productData.unit || 'pcs',
        status: productData.status || 'active',
        organizationId: productData.organizationId || organizationId,
        dataCompleteness: 50,
        missingDataFields: [],
        parentIds: productData.parentIds || [],
        childrenIds: productData.childrenIds || [],
        metadata: productData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProducts(prev => [...prev, newProduct]);
    } else {
      // Update existing product
      setProducts(prev => prev.map(p => 
        p.id === productData.id 
          ? { ...p, ...productData, updatedAt: new Date().toISOString() }
          : p
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Tree View Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This demo shows the enhanced tree view with edit functionality. Try the following:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Click &quot;Edit Mode&quot; to enable editing</li>
              <li>Hover over tree nodes to see the add child button</li>
              <li>Click the add button to create new child products</li>
              <li>Use the edit button in the details panel to modify existing products</li>
              <li>Notice external products (from org-2) cannot be edited</li>
            </ul>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Current Organization: {organizationId}</Badge>
              <Badge variant="secondary">Products: {products.length}</Badge>
              <Badge variant="outline">Saved: {savedProducts.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree View */}
      <Card className="h-[800px]">
        <CardContent className="h-full p-0">
          <ProductTreeView
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onSaveProduct={handleSaveProduct}
            currentOrganizationId={organizationId}
            initialViewType={ViewType.SUPPLIER}
          />
        </CardContent>
      </Card>

      {/* Saved Products Log (for demo purposes) */}
      {savedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Saved Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedProducts.map((product, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <strong>{product.name}</strong> ({product.sku}) - {product.type}
                  {product.parentIds && product.parentIds.length > 0 && (
                    <span className="text-gray-500 ml-2">
                      → Child of: {product.parentIds.join(', ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TreeViewDemo;
