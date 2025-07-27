"use client"

import { useState } from "react"
import { useGetProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/src/api/product"
import { GlobalLoading } from "@/src/components/global-loading"
import { ErrorComponent } from "@/src/components/ui/error"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"
import { Search, PlusCircle, Eye, Edit, Trash2, Package, Box } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { ProductForm } from "@/src/components/products/product-form"
import { CreateProductRequest, Product } from "@/src/types"
import { useToast } from "@/src/components/ui/use-toast"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import Link from "next/link"

export default function ManagementPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const { products, isLoading, isError, mutate } = useGetProducts({
    search: search,
    category: category === 'all' ? undefined : category,
    flatView: true // Get flat view for list display
  });

  const { createProduct } = useCreateProduct();
  const { updateProduct } = useUpdateProduct();
  const { deleteProduct } = useDeleteProduct();

  const handleFormSubmit = async (data: CreateProductRequest) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id.toString(), data);
        toast({ title: "Product Updated", description: "The product has been successfully updated." });
      } else {
        await createProduct(data);
        toast({ title: "Product Created", description: "The new product has been successfully created." });
      }
      mutate();
      closeModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      try {
        await deleteProduct(selectedProduct.id.toString());
        toast({ title: "Product Deleted", description: "The product has been successfully deleted." });
        mutate();
        setIsDeleteDialogOpen(false);
        setSelectedProduct(undefined);
      } catch (error) {
        toast({
          title: "Error Deleting Product",
          description: "There was an error deleting the product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const openModal = (product?: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setSelectedProduct(undefined);
    setIsModalOpen(false);
  }

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <GlobalLoading />;
  }

  if (isError) {
    return <ErrorComponent title="Error Loading Products" description="There was an error loading the product data. Please try again later." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={() => openModal()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="footwear">Footwear</SelectItem>
            <SelectItem value="apparel">Apparel</SelectItem>
            <SelectItem value="textile">Textile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product List */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Product List</span>
              <span className="text-sm font-normal text-gray-500">
                {products?.length || 0} products
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.type === 'final_product' ? (
                          <Package className="h-6 w-6 text-gray-600" />
                        ) : (
                          <Box className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {product.type?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          SKU: {product.sku || 'N/A'} • Category: {product.category || 'N/A'}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            Qty: {product.quantity} {product.unit}
                          </span>
                          {product.metadata?.sustainabilityScore && (
                            <span className="text-xs text-green-600">
                              Sustainability: {product.metadata.sustainabilityScore}%
                            </span>
                          )}
                          {product.metadata?.originCountry && (
                            <span className="text-xs text-gray-500">
                              Origin: {product.metadata.originCountry}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/management/${product.id}`}>
                        <Button variant="ghost" size="icon" title="View Tree">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => openModal(product)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(product)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first product</p>
                  <Button onClick={() => openModal()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            initialData={selectedProduct}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

