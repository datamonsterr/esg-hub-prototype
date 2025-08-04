"use client"

import { useState, useRef } from 'react';
import { Product } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { RefreshCw, Edit, X } from 'lucide-react';
import SupplierTreeView, { SupplierTreeViewRef } from './supplier-tree-view';
import BrandTreeView, { BrandTreeViewRef } from './brand-tree-view';
export enum ViewType {
  SUPPLIER = 'supplier',
  BRAND = 'brand',
}

interface ProductTreeViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdate?: (product: Product) => void;
  onSaveProduct?: (product: Partial<Product>) => void;
  onReload?: () => void; // Add reload callback
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
  onSaveProduct,
  onReload,
  selectedProductId, 
  initialViewType = ViewType.SUPPLIER, 
  singleProductMode = false, 
  currentOrganizationId 
}: ProductTreeViewProps) => {
  const [activeTab, setActiveTab] = useState<ViewType>(initialViewType);
  const [isReloading, setIsReloading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const supplierTreeRef = useRef<SupplierTreeViewRef | null>(null);
  const brandTreeRef = useRef<BrandTreeViewRef | null>(null);

  const handleReload = async () => {
    setIsReloading(true);
    try {
      // Call parent reload if provided
      if (onReload) {
        await onReload();
      }
      
      // Reload the current tree view
      if (activeTab === ViewType.SUPPLIER && supplierTreeRef.current) {
        supplierTreeRef.current.reload();
      } else if (activeTab === ViewType.BRAND && brandTreeRef.current) {
        brandTreeRef.current.reload();
      }
    } finally {
      setIsReloading(false);
    }
  };

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Tree View</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={handleEditModeToggle}
              className="flex items-center gap-2"
            >
              {isEditMode ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel Edit
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Mode
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReload}
              disabled={isReloading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
              Reload
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={ViewType.SUPPLIER}>Suppliers</TabsTrigger>
            <TabsTrigger value={ViewType.BRAND}>Brands</TabsTrigger>
          </TabsList>
          
          <TabsContent value={ViewType.SUPPLIER} className="mt-4 h-full">
            <SupplierTreeView
              ref={supplierTreeRef}
              products={products}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onSaveProduct={onSaveProduct}
              selectedProductId={selectedProductId}
              singleProductMode={singleProductMode}
              currentOrganizationId={currentOrganizationId}
              isEditMode={isEditMode}
            />
          </TabsContent>
          <TabsContent value={ViewType.BRAND} className="mt-4 h-full">
            <BrandTreeView
              ref={brandTreeRef}
              products={products}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onSaveProduct={onSaveProduct}
              selectedProductId={selectedProductId}
              singleProductMode={singleProductMode}
              currentOrganizationId={currentOrganizationId}
              isEditMode={isEditMode}
            />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProductTreeView; 