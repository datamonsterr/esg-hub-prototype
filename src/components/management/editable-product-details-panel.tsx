"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { X, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { Product } from '@/src/types';
import { useTreeEdit } from './tree-edit-context';
import { useCreateProduct, useUpdateProduct, useGetProductById } from '@/src/api/product';
import { toast } from 'sonner';

interface EditableProductDetailsPanelProps {
  currentOrganizationId?: string;
  onSave?: (product: Partial<Product>) => void;
  onCancel?: () => void;
  onProductCreated?: (product: Product) => void;
  onProductUpdated?: (product: Product) => void;
}

const EditableProductDetailsPanel = ({
  currentOrganizationId,
  onSave,
  onCancel,
  onProductCreated,
  onProductUpdated
}: EditableProductDetailsPanelProps) => {
  const {
    selectedNodeForEdit,
    showEditPanel,
    setShowEditPanel,
    editAction,
    setEditAction,
    pendingParentId,
    setPendingParentId,
    setSelectedNodeForEdit
  } = useTreeEdit();

  // API hooks
  const { createProduct, isLoading: isCreating } = useCreateProduct();
  const { updateProduct, isLoading: isUpdating } = useUpdateProduct();
  const { product: parentProduct } = useGetProductById(pendingParentId || '');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    description: '',
    category: '',
    type: 'component',
    quantity: 1,
    unit: 'pcs',
    status: 'active',
    organizationId: currentOrganizationId || '',
    parentIds: [],
    childrenIds: [],
    metadata: {},
    dataCompleteness: 0,
    missingDataFields: []
  });

  const [customProperties, setCustomProperties] = useState<Array<{ key: string; value: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Update form data when selectedNodeForEdit changes
  useEffect(() => {
    if (editAction === 'edit' && selectedNodeForEdit) {
      setFormData({
        ...selectedNodeForEdit,
        parentIds: selectedNodeForEdit.parentIds || [],
        childrenIds: selectedNodeForEdit.childrenIds || []
      });
      
      // Extract custom properties from metadata
      const metadata = selectedNodeForEdit.metadata || {};
      const customProps = Object.entries(metadata).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setCustomProperties(customProps);
    } else if (editAction === 'add') {
      // Reset form for new product
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        type: 'component',
        quantity: 1,
        unit: 'pcs',
        status: 'active',
        organizationId: currentOrganizationId || '',
        parentIds: pendingParentId ? [pendingParentId] : [],
        childrenIds: [],
        metadata: {},
        dataCompleteness: 0,
        missingDataFields: []
      });
      setCustomProperties([]);
    }
  }, [selectedNodeForEdit, editAction, pendingParentId, currentOrganizationId]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomPropertyChange = (index: number, field: 'key' | 'value', value: string) => {
    setCustomProperties(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addCustomProperty = () => {
    setCustomProperties(prev => [...prev, { key: '', value: '' }]);
  };

  const removeCustomProperty = (index: number) => {
    setCustomProperties(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Build metadata from custom properties
      const metadata = customProperties.reduce((acc, prop) => {
        if (prop.key.trim()) {
          acc[prop.key.trim()] = prop.value;
        }
        return acc;
      }, {} as Record<string, any>);

      const productData = {
        ...formData,
        metadata,
        createdAt: selectedNodeForEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editAction === 'add') {
        // Create new product
        const newProduct = await createProduct({
          name: productData.name || '',
          sku: productData.sku || '',
          description: productData.description || '',
          category: productData.category || '',
          type: productData.type || 'component',
          quantity: productData.quantity || 1,
          unit: productData.unit || 'pcs',
          parentIds: productData.parentIds || [],
          metadata: productData.metadata || {}
        });

        // If this product has a parent, update the parent's childrenIds
        if (pendingParentId && parentProduct) {
          try {
            const currentChildrenIds = parentProduct.childrenIds || [];
            await updateProduct(pendingParentId, {
              childrenIds: [...currentChildrenIds, newProduct.id]
            });
          } catch (error) {
            console.error('Error updating parent product childrenIds:', error);
            // Don't fail the whole operation if parent update fails
          }
        }

        toast.success(`Product Created: ${newProduct.name} has been created successfully.`);

        if (onProductCreated) {
          onProductCreated(newProduct);
        }
      } else if (editAction === 'edit' && selectedNodeForEdit) {
        // Update existing product
        const updatedProduct = await updateProduct(selectedNodeForEdit.id, {
          name: productData.name || '',
          sku: productData.sku || '',
          description: productData.description || '',
          category: productData.category || '',
          type: productData.type || 'component',
          quantity: productData.quantity || 1,
          unit: productData.unit || 'pcs',
          status: productData.status || 'active',
          parentIds: productData.parentIds || [],
          childrenIds: productData.childrenIds || [],
          metadata: productData.metadata || {}
        });

        toast.success(`Product Updated: ${updatedProduct.name} has been updated successfully.`);

        if (onProductUpdated) {
          onProductUpdated(updatedProduct);
        }
      }

      // Call the legacy onSave callback if provided
      if (onSave) {
        onSave(productData);
      }

      handleCancel();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error("Failed to save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShowEditPanel(false);
    setEditAction(null);
    setSelectedNodeForEdit(null);
    setPendingParentId(null);
    if (onCancel) {
      onCancel();
    }
  };

  if (!showEditPanel) {
    return null;
  }

  const isEditing = editAction === 'edit';
  const title = isEditing ? 'Edit Product' : 'Add New Product';

  return (
    <div className="w-1/3 bg-white border-l p-4 overflow-y-auto h-[800px] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8"
          disabled={isSaving || isCreating || isUpdating}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                disabled={isSaving || isCreating || isUpdating}
              />
            </div>

            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Enter SKU"
                disabled={isSaving || isCreating || isUpdating}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
                disabled={isSaving || isCreating || isUpdating}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Category"
                  disabled={isSaving || isCreating || isUpdating}
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  disabled={isSaving || isCreating || isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw_material">Raw Material</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                    <SelectItem value="sub_assembly">Sub Assembly</SelectItem>
                    <SelectItem value="final_product">Final Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || 1}
                  onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 1)}
                  min="0"
                  step="0.01"
                  disabled={isSaving || isCreating || isUpdating}
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit || ''}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  placeholder="pcs, kg, etc."
                  disabled={isSaving || isCreating || isUpdating}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={isSaving || isCreating || isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Custom Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Custom Properties</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={addCustomProperty}
              className="h-8"
              disabled={isSaving || isCreating || isUpdating}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Property
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {customProperties.map((prop, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="Property name"
                  value={prop.key}
                  onChange={(e) => handleCustomPropertyChange(index, 'key', e.target.value)}
                  className="flex-1"
                  disabled={isSaving || isCreating || isUpdating}
                />
                <Input
                  placeholder="Value"
                  value={prop.value}
                  onChange={(e) => handleCustomPropertyChange(index, 'value', e.target.value)}
                  className="flex-1"
                  disabled={isSaving || isCreating || isUpdating}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustomProperty(index)}
                  className="h-8 w-8"
                  disabled={isSaving || isCreating || isUpdating}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            {customProperties.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No custom properties added yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          <Button 
            onClick={handleSave} 
            className="flex-1" 
            disabled={isSaving || isCreating || isUpdating}
          >
            {isSaving || isCreating || isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving || isCreating || isUpdating 
              ? 'Saving...' 
              : isEditing 
                ? 'Save Changes' 
                : 'Create Product'
            }
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSaving || isCreating || isUpdating}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditableProductDetailsPanel;
