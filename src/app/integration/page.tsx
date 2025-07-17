"use client"

import { useState } from "react"
import { ProductSelectDialog } from "@/src/components/products/product-select-dialog"
import { DataIntegrations } from "./integration"
import { FileUpload } from "./file-upload"
import ValidationPage from "./validation"
import { Product } from "@/src/types/product"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Package } from "lucide-react"

function SelectedProductCard({ selectedProduct, onOpenDialog }: { selectedProduct: Product | null, onOpenDialog: () => void }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Selected Product</CardTitle>
        <CardDescription>
          This is the product for which you are setting up the data integration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedProduct ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Package className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{selectedProduct.name}</p>
                {selectedProduct.description && <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>}
              </div>
            </div>
            <Button variant="outline" onClick={onOpenDialog}>
              Change Product
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted bg-muted/25 p-8 text-center">
            <p className="text-sm text-muted-foreground">No product selected.</p>
            <Button onClick={onOpenDialog}>Select a Product</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DataIntegrationPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false)
  const [step, setStep] = useState<'integration' | 'upload' | 'validation'>('integration')
  const [documentId, setDocumentId] = useState<string | null>(null)

  // Handler for starting upload
  const handleStartUpload = () => {
    setStep('upload')
  }

  // Handler for upload completion
  const handleUploadComplete = (docId: string) => {
    setDocumentId(docId)
    setStep('validation')
  }

  // Handler for product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setIsProductSelectOpen(false)
  }

  return (
    <div className="space-y-8">
      <SelectedProductCard selectedProduct={selectedProduct} onOpenDialog={() => setIsProductSelectOpen(true)} />
      <ProductSelectDialog
        open={isProductSelectOpen}
        onOpenChange={setIsProductSelectOpen}
        onProductSelect={handleProductSelect}
      />
      {step === 'integration' && (
        <DataIntegrations
          selectedProduct={selectedProduct}
          onProductSelect={() => setIsProductSelectOpen(true)}
          onStartUpload={handleStartUpload}
        />
      )}
      {step === 'upload' && (
        <FileUpload
          selectedProduct={selectedProduct}
          onNavigateBack={() => setStep('integration')}
          onUploadComplete={handleUploadComplete}
        />
      )}
      {step === 'validation' && documentId && (
        <ValidationPage
          documentId={documentId}
          selectedProduct={selectedProduct}
        />
      )}
    </div>
  )
} 