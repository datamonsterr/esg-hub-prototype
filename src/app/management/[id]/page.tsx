"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useGetProducts, useGetProduct } from "@/src/api/product"
import { GlobalLoading } from "@/src/components/global-loading"
import { ErrorComponent } from "@/src/components/ui/error"
import ProductTreeView from "@/src/components/management/product-tree-view"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Product, ProductNode } from "@/src/types"
import Link from "next/link"
import { useOrganizationId } from "@/src/hooks/useUserContext"

export default function ProductTreePage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const organizationId = useOrganizationId()

  
  
  // Get the specific product first
  const { product: selectedProduct, isLoading, isError } = useGetProduct(productId)

  const handleEdit = (product: Product) => {
    // Navigate to edit page or open modal
    console.log('Edit product:', product);
  }

  const handleDelete = (product: Product) => {
    // Handle delete action
    console.log('Delete product:', product);
  }

  const handleSaveProduct = (productData: Partial<Product>) => {
    // Handle saving new/edited product
    console.log('Save product:', productData);
    // Here you would typically call an API to save the product
    // For now, we'll just log it
  }

  if (isLoading) {
    return <GlobalLoading />
  }

  if (isError) {
    return <ErrorComponent title="Error Loading Product" description="There was an error loading the product data. Please try again later." />
  }

  if (!selectedProduct) {
    return (
      <div className="space-y-6 h-full">
        <div className="flex items-center space-x-4">
          <Link href="/management">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Product Not Found</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">The requested product could not be found.</p>
          <Link href="/management">
            <Button>Back to Product Management</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full min-h-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/management">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{selectedProduct.name}</h1>
            <p className="text-gray-600">Product Tree Visualization</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleEdit(selectedProduct)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
          <Button variant="destructive" onClick={() => handleDelete(selectedProduct)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product Tree View */}
      <div className="h-full min-h-[1600px]">
        <ProductTreeView 
          products={[selectedProduct]} 
          singleProductMode={true}
          selectedProductId={selectedProduct?.id}
          onEdit={handleEdit} 
          onDelete={handleDelete}
          onSaveProduct={handleSaveProduct}
          currentOrganizationId={organizationId || ''}
        />
      </div>
    </div>
  )
}
