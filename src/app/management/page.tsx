"use client"

import { useState } from "react"
import { useGetProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/src/api/product"
import { GlobalLoading } from "@/src/components/global-loading"
import { ErrorComponent } from "@/src/components/ui/error"
import ProductTreeView from "@/src/components/management/product-tree-view"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"
import { Search, PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { ProductForm } from "@/src/components/products/product-form"
import { CreateProductRequest, Product } from "@/src/types"
import { useToast } from "@/src/components/ui/use-toast"
import { WidgetCard } from "@/src/components/ui/widget-card"
import { RecentActivities } from "@/src/components/management/recent-activities"

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
    flatView: false // Ensure we get the hierarchical tree structure
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

      <div>
        {products && <ProductTreeView products={products} onEdit={openModal} onDelete={openDeleteDialog} />}
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
      
      <WidgetCard title="Recent Activities">
        <RecentActivities />
      </WidgetCard>
    </div>
  )
}

