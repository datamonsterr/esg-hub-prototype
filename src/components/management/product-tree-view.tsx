"use client"

import { useState } from 'react';
import { Product } from '@/src/types';
import { ChevronRight, ChevronDown, Package, Box, ShieldCheck, MapPin, TrendingUp, Info, Edit, Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface ProductTreeViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTreeView = ({ products, onEdit, onDelete }: ProductTreeViewProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string | number) => {
    const stringId = id.toString();
    setExpandedNodes(prev => ({ ...prev, [stringId]: !prev[stringId] }));
  };

  const renderProductRow = (product: Product, level = 0) => {
    const isExpanded = expandedNodes[product.id.toString()] || false;
    const hasChildren = product.children && product.children.length > 0;

    return (
      <li key={product.id} className="border-b">
        <div 
          className="flex items-center space-x-2 py-3 px-4"
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          <div className="flex items-center w-full">
            <div className="flex items-center flex-1">
              {hasChildren ? (
                <button onClick={() => toggleNode(product.id)} className="p-1 -ml-2">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <div className="w-6" />
              )}
              {level === 0 ? <Package size={18} className="text-gray-700 ml-2" /> : <Box size={16} className="text-gray-600 ml-2" />}
              <span className={`ml-3 ${level === 0 ? 'font-semibold text-base' : 'font-medium'}`}>{product.name}</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {product.type?.replace('_', ' ') || 'product'}
              </Badge>
            </div>
            <div className="w-1/5 text-sm text-gray-500">{product.sku}</div>
            <div className="w-1/5">
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                {product.status}
              </span>
            </div>
            <div className="w-1/5 text-sm text-gray-500">{new Date(product.updatedAt).toLocaleDateString()}</div>
            <div className="w-auto flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(product)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="bg-gray-50">
            {level === 0 && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sustainability Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{product.metadata?.sustainabilityScore || 'N/A'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Origin Country</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{product.metadata?.originCountry || 'N/A'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Certifications</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {product.metadata?.certifications?.map((c: string) => <Badge key={c} variant="secondary">{c}</Badge>) ?? <p className='text-sm'>N/A</p>}
                    </div>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Data Completeness</CardTitle>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{product.dataCompleteness || 'N/A'}%</div>
                  </CardContent>
                </Card>
              </div>
            )}
            {hasChildren && (
              <ul className="list-none">
                {product.children?.map(child => renderProductRow(child, level + 1))}
              </ul>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm">
       <div className="flex items-center space-x-2 p-4 bg-gray-50 border-b">
          <div className="flex items-center w-full">
            <div className="flex items-center flex-1 font-semibold text-sm text-gray-600 uppercase">
                <div className="w-8" />
                Product Name & Type
            </div>
            <div className="w-1/5 font-semibold text-sm text-gray-600 uppercase">SKU</div>
            <div className="w-1/5 font-semibold text-sm text-gray-600 uppercase">Status</div>
            <div className="w-1/5 font-semibold text-sm text-gray-600 uppercase">Last Updated</div>
            <div className="w-auto font-semibold text-sm text-gray-600 uppercase">Actions</div>
          </div>
        </div>
      <ul className="list-none">
        {products.map(product => renderProductRow(product))}
      </ul>
    </div>
  );
};

export default ProductTreeView; 