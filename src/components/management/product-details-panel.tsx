"use client"

import { useRouter } from 'next/navigation';
import { Product } from '@/src/types';
import { Package, ShieldCheck, MapPin, TrendingUp, Info, Edit, Trash2, ArrowRight, AlertTriangle, X, ChevronLeft } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface ProductDetailsPanelProps {
  selectedProduct: Product | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdate?: (product: Product) => void;
  currentOrganizationId?: string;
  viewType?: 'downstream' | 'upstream';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ProductDetailsPanel = ({ 
  selectedProduct, 
  onEdit, 
  onDelete,
  onUpdate,
  currentOrganizationId,
  viewType = 'downstream',
  isCollapsed = false,
  onToggleCollapse
}: ProductDetailsPanelProps) => {
  const router = useRouter();

  // Show collapsed state with arrow button
  if (isCollapsed) {
    return (
      <div className="w-12 bg-gray-50 border-l flex items-start justify-center pt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="w-1/3 bg-gray-50 border-l p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-400">No product selected</h3>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500">Select a product from the tree to view details.</p>
      </div>
    );
  }

  const isExternalProduct = currentOrganizationId ? 
    selectedProduct.organizationId !== currentOrganizationId : 
    false;

  const handleUpdate = (updatedProduct: Product) => {
    if (onUpdate) {
      onUpdate(updatedProduct);
    }
  };

  return (
    <div className="w-1/3 bg-gray-50 border-l p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
        <div className="flex items-center space-x-2">
          {!isExternalProduct && (
            <>
              <Button variant="ghost" size="icon" onClick={() => onEdit(selectedProduct)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(selectedProduct)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {!isExternalProduct ? (
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
                    <Package size={14} className="text-gray-600" />
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
    </div>
  );
};

export default ProductDetailsPanel;
