"use client"

import { useState } from 'react';
import { Product } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import SupplierTreeView from './supplier-tree-view';
import BrandTreeView from './brand-tree-view';
export enum ViewType {
  SUPPLIER = 'supplier',
  BRAND = 'brand',
}

interface ProductTreeViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdate?: (product: Product) => void;
  selectedProductId?: string; // Optional prop to pre-select a specific product
  initialViewType?: ViewType; // Make this optional with default
  singleProductMode?: boolean; // Whether to operate in single product mode (dynamic loading)
  currentOrganizationId?: string; // Current organization ID to detect external products
}

const ProductTreeView = ({ 
  products, 
  onEdit, 
  onDelete,
  onUpdate,
  selectedProductId, 
  initialViewType = ViewType.SUPPLIER, 
  singleProductMode = false, 
  currentOrganizationId 
}: ProductTreeViewProps) => {
  const [activeTab, setActiveTab] = useState<ViewType>(initialViewType);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Product Tree View</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={ViewType.SUPPLIER}>Suppliers</TabsTrigger>
            <TabsTrigger value={ViewType.BRAND}>Brands</TabsTrigger>
          </TabsList>
          
          <TabsContent value={ViewType.SUPPLIER} className="mt-4 h-full">
            <SupplierTreeView
              products={products}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={onUpdate}
              selectedProductId={selectedProductId}
              singleProductMode={singleProductMode}
              currentOrganizationId={currentOrganizationId}
            />
          </TabsContent>
          <TabsContent value={ViewType.BRAND} className="mt-4 h-full">
            <BrandTreeView
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