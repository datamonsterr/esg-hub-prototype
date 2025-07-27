"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useGetProducts } from "@/src/api/product"
import { GlobalLoading } from "@/src/components/global-loading"
import { ErrorComponent } from "@/src/components/ui/error"
import ProductTreeView from "@/src/components/management/product-tree-view"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Product, ProductNode } from "@/src/types"
import Link from "next/link"

export default function ProductTreePage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { products, isLoading, isError } = useGetProducts({
    flatView: false // We need hierarchical structure for tree view
  })

  // Find the specific product and build its hierarchy
  const { selectedProduct, productsWithHierarchy } = useMemo(() => {
    if (!products || !productId) return { selectedProduct: null, productsWithHierarchy: [] }

    // Build hierarchical structure from children_ids
    const productMap = new Map(products.map(p => [p.id, { ...p, children: [] as ProductNode[] }]))
    
    products.forEach(product => {
      if (product.childrenIds && product.childrenIds.length > 0) {
        const productWithChildren = productMap.get(product.id)
        if (productWithChildren) {
          productWithChildren.children = product.childrenIds
            .map(childId => productMap.get(childId))
            .filter((child): child is ProductNode => Boolean(child)) as ProductNode[]
        }
      }
    })

    const productsWithHierarchy = Array.from(productMap.values()) as ProductNode[]
    const selectedProduct = productsWithHierarchy.find(p => p.id === productId)

    return { selectedProduct, productsWithHierarchy }
  }, [products, productId])

  const handleEdit = (product: Product) => {
    // Navigate to edit page or open modal
    console.log('Edit product:', product)
  }

  const handleDelete = (product: Product) => {
    // Handle delete action
    console.log('Delete product:', product)
  }

  if (isLoading) {
    return <GlobalLoading />
  }

  if (isError) {
    return <ErrorComponent title="Error Loading Product" description="There was an error loading the product data. Please try again later." />
  }

  if (!selectedProduct) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
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
      <div className="h-[calc(100vh-12rem)]">
        <ProductTreeView 
          products={[selectedProduct as Product]} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>
    </div>
  )
}
