"use client"

import { useState } from 'react';
import { Product } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import DownstreamTreeView from './downstream-tree-view';
import UpstreamTreeView from './upstream-tree-view';

interface ProductTreeViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdate?: (product: Product) => void;
  selectedProductId?: string; // Optional prop to pre-select a specific product
  initialViewType?: 'downstream' | 'upstream'; // Make this optional with default
  singleProductMode?: boolean; // Whether to operate in single product mode (dynamic loading)
  currentOrganizationId?: string; // Current organization ID to detect external products
}

const ProductTreeView = ({ 
  products, 
  onEdit, 
  onDelete,
  onUpdate,
  selectedProductId, 
  initialViewType = 'downstream', 
  singleProductMode = false, 
  currentOrganizationId 
}: ProductTreeViewProps) => {
  const [activeTab, setActiveTab] = useState<'downstream' | 'upstream'>(initialViewType);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Product Tree View</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'downstream' | 'upstream')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="downstream">Suppliers</TabsTrigger>
            <TabsTrigger value="upstream">Brands</TabsTrigger>
          </TabsList>
          
          <TabsContent value="downstream" className="mt-4">
            <DownstreamTreeView
              products={products}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={onUpdate}
              selectedProductId={selectedProductId}
              singleProductMode={singleProductMode}
              currentOrganizationId={currentOrganizationId}
            />
          </TabsContent>
          
          <TabsContent value="upstream" className="mt-4">
            <UpstreamTreeView
              products={products}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={onUpdate}
              selectedProductId={selectedProductId}
              singleProductMode={singleProductMode}
              currentOrganizationId={currentOrganizationId}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProductTreeView; 