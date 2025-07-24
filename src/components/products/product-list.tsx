"use client"

import { useState, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Product } from "@/src/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Filter,
  SortAsc,
  SortDesc,
  Package,
  AlertCircle
} from "lucide-react"
import { useDeleteProduct, useGetProducts } from "@/src/api/product"

interface ProductListProps {
  onProductCreate?: () => void
  onProductEdit?: (product: Product) => void
  onProductView?: (product: Product) => void
  selectionMode?: boolean
}

type SortField = 'name' | 'sku' | 'category' | 'createdAt' | 'dataCompleteness'
type SortOrder = 'asc' | 'desc'

export function ProductList({
  onProductCreate: onProductCreate,
  onProductEdit: onProductEdit,
  onProductView: onProductView,
  selectionMode = false
}: ProductListProps) {
  const { user } = useUser()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const organizationId = user?.publicMetadata?.organizationId as string

  const { products, isLoading, isError, mutate } = useGetProducts({
    organizationId,
    search: searchQuery || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined
  })

  const { deleteProduct } = useDeleteProduct()

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!products) return []
    const uniqueCategories = [...new Set(products.map(p => p.category))]
    return uniqueCategories.filter(Boolean)
  }, [products])

  // Sort and filter products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return []

    let filtered = [...products]

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle different data types
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [products, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await deleteProduct(productId)
      mutate() // Refresh the list
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleProductView = (product: Product) => {
    if (onProductView) {
      onProductView(product)
    } else {
      router.push(`/products/${product.id}`)
    }
  }

  const handleProductEdit = (product: Product) => {
    if (onProductEdit) {
      onProductEdit(product)
    } else {
      router.push(`/products/${product.id}/edit`)
    }
  }

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 80) return "bg-green-500"
    if (completeness >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getCompletenessVariant = (completeness: number) => {
    if (completeness >= 80) return "default"
    if (completeness >= 60) return "secondary"
    return "destructive"
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <SortAsc className="h-4 w-4 opacity-50" />
    return sortOrder === 'asc'
      ? <SortAsc className="h-4 w-4" />
      : <SortDesc className="h-4 w-4" />
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load products</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products
            {products && (
              <Badge variant="secondary">{products.length}</Badge>
            )}
          </CardTitle>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>

        {/* Products Table */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : !filteredAndSortedProducts.length ? (
          <div className="text-center p-8">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery || categoryFilter !== "all"
                ? "No products match your search criteria"
                : "No products found. Create your first product to get started."
              }
            </p>
            {!searchQuery && categoryFilter === "all" && !selectionMode && (
              <Button onClick={onProductCreate} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Product Name
                      <SortIcon field="name" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center gap-2">
                      SKU
                      <SortIcon field="sku" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-2">
                      Category
                      <SortIcon field="category" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('dataCompleteness')}
                  >
                    <div className="flex items-center gap-2">
                      Data Completeness
                      <SortIcon field="dataCompleteness" />
                    </div>
                  </TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      <SortIcon field="createdAt" />
                    </div>
                  </TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleProductView(product)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-1 py-0.5 rounded">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getCompletenessColor(product.dataCompleteness)}`}
                              style={{ width: `${product.dataCompleteness}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {product.dataCompleteness}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {(product.children?.length || 0)} components
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {selectionMode ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProductView(product)
                          }}
                        >
                          Select
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleProductView(product)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleProductEdit(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 