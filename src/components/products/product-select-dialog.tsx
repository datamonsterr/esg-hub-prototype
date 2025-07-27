"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { ProductList } from "./product-list"
import { Product } from "@/src/types/product"

interface ProductSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductSelect: (product: Product) => void
}

export function ProductSelectDialog({
  open,
  onOpenChange,
  onProductSelect
}: ProductSelectDialogProps) {
  const handleSelect = (product: Product) => {
    onProductSelect(product)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a Product</DialogTitle>
          <DialogDescription>
            Choose any product from your organization to associate with this integration. 
            The integration will automatically add data to the selected product.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex-grow overflow-y-auto">
          <ProductList selectionMode onProductView={handleSelect} />
        </div>
      </DialogContent>
    </Dialog>
  )
} 