"use client"

import { useGetDocument } from "@/src/api/integration"
import { GlobalLoading } from "@/src/components/global-loading"
import { Button } from "@/src/components/ui/button"
import { ErrorComponent } from "@/src/components/ui/error"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { WidgetCard } from "@/src/components/ui/widget-card"
import { ExtractedProductTree } from "@/src/components/validation/extracted-product-tree"
import { Product } from "@/src/types/product"
import { Bot, ChevronDown, ChevronRight, Edit, Plus, Trash2 } from "lucide-react"
import { use, useState } from "react"

interface ValidationPageProps {
  params: Promise<{ productId: string }>
}

export default function ValidationPage({ params }: ValidationPageProps) {
  const { productId } = use(params)
  const [showDocumentPreview, setShowDocumentPreview] = useState(false)

  const { document, isLoading: documentLoading, isError: documentError } = useGetDocument(productId)
  // const { filePreview, isLoading: previewLoading, isError: previewError } = useGetFilePreview(productId)
  // const { documentSummary, isLoading: summaryLoading, isError: summaryError } = useGetDocumentSummary(productId)

  // Mock components data based on the HTML structure
  const mockComponents = [
    {
      id: "0010",
      componentNumber: "LE-VN-A-2024",
      setupId: "SETUP-001",
      description: "Leather - Vietnam Grade A",
      quantity: "0.350",
      unit: "KG",
      category: "Raw Material",
      supplierInfo: "Supplier ID: 6",
      estimatedCost: "",
      customProperties: []
    },
    {
      id: "0020",
      componentNumber: "CT-IN-ORG-2024",
      setupId: "SETUP-002",
      description: "Organic Cotton Fabric - India",
      quantity: "0.250",
      unit: "M2",
      category: "Raw Material",
      supplierInfo: "Supplier ID: 7",
      estimatedCost: "",
      customProperties: []
    }
  ]

  const mockProduct: Product = {
    id: productId,
    organizationId: "org-001",
    name: "Adidas Samba Limited Edition (Sustainable Materials)",
    type: "final_product",
    sku: "SAMBA-LTD-2024",
    description: "High-performance running shoe made from sustainable materials",
    category: "footwear",
    quantity: 10000,
    unit: "PR (Pair)",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dataCompleteness: 85,
    missingDataFields: ["water_usage", "energy_consumption"],
    children: [],
    metadata: {
      sustainabilityScore: 8.5,
      certifications: ["GOTS", "Carbon Neutral"],
      originCountry: "Vietnam",
      carbonFootprint: 12.5
    }
  };

  if (documentLoading) {
    return <GlobalLoading />
  }

  if (documentError) {
    return <ErrorComponent title="Error" description="Failed to load validation data" />
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4 bg-white">
        <div>
          <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-brand">
            <Bot className="h-4 w-4 mr-2" />
            Re-prompt AI
          </Button>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="bg-gray-200 hover:bg-gray-300 rounded-brand">Save as Draft</Button>
          <Button className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand">
            <Edit className="h-4 w-4 mr-2" />
            Save Data
          </Button>
        </div>
      </div>

      {/* Document Preview Toggle */}
      <div className="px-8 py-4 bg-white border-b">
        <button
          onClick={() => setShowDocumentPreview(!showDocumentPreview)}
          className="flex items-center space-x-2 text-brand-primary hover:text-brand-primary/80 transition-colors"
        >
          {showDocumentPreview ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="font-medium">Document Preview</span>
        </button>
        {/* {showDocumentPreview && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-brand">
            <FilePreview documentId={productId} />
          </div>
        )} */}
      </div>

      <div className="flex-1 px-8 py-8 space-y-8">
        {/* Product Tree Section */}
        <WidgetCard title="Product Tree">
          <ExtractedProductTree tree={mockProduct} onChange={() => { }} />
        </WidgetCard>

        {/* Product Header Information */}
        <div className="bg-white p-6 border border-gray-200 rounded-brand shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Product Header Information</h3>
            <Button variant="outline" size="sm" className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-brand">
              <Bot className="h-4 w-4 mr-1" />
              AI Edit
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-5">Extracted from the BOM header. Edit fields as needed.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Number</label>
              <Input defaultValue="SAMBA-LTD-2024" className="rounded-brand border-border-light" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plant</label>
              <Input defaultValue="VN01 (Vietnam Tier 1)" className="rounded-brand border-border-light" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                defaultValue="Adidas Samba Limited Edition (Sustainable Materials) - High-performance running shoe made from sustainable materials"
                rows={2}
                className="rounded-brand border-border-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Unit of Measure</label>
              <Input defaultValue="PR (Pair)" className="rounded-brand border-border-light" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Hierarchy</label>
              <Input defaultValue="FERT (Finished Product)" className="rounded-brand border-border-light" />
            </div>
          </div>
        </div>

        {/* Components Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Bill of Materials - Components</h3>
            <Button variant="outline" className="rounded-brand">
              <Plus className="h-4 w-4 mr-2" />
              Add Component
            </Button>
          </div>

          {mockComponents.map((component, index) => (
            <div key={component.id} className="bg-white p-6 border border-gray-200 rounded-brand shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-900">Component #{component.id}</h4>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Button variant="outline" size="sm" className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-brand">
                      <Bot className="h-4 w-4 mr-1" />
                      AI Edit
                    </Button>
                  </div>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Component Number</label>
                  <Input
                    defaultValue={component.componentNumber}
                    className="rounded-brand border-border-light focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Setup ID</label>
                  <Input
                    defaultValue={component.setupId}
                    className="rounded-brand border-border-light focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    defaultValue={component.description}
                    rows={2}
                    className="rounded-brand border-border-light focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <Input
                    defaultValue={component.quantity}
                    className="rounded-brand border-border-light focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                  <Input
                    defaultValue={component.unit}
                    className="rounded-brand border-border-light focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Input
                    defaultValue={component.category}
                    className="rounded-brand border-border-light focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Information</label>
                  <Input
                    defaultValue={component.supplierInfo}
                    className="rounded-brand border-border-light focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                  <Input
                    defaultValue={component.estimatedCost}
                    placeholder="$0.00"
                    className="rounded-brand border-border-light focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Custom Properties for Component */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-bold text-gray-900">Custom Properties</h5>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-100 text-gray-700 hover:bg-green-200 rounded-brand"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Property
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Property Name" className="rounded-brand border-border-light" />
                    <Input placeholder="Property Value" className="rounded-brand border-border-light" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Document Summary and File Preview in smaller cards */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WidgetCard title="Document Summary">
            <DocumentSummary documentId={productId} />
          </WidgetCard>
          <WidgetCard title="File Preview">
            <div className="max-h-96 overflow-y-auto">
              <FilePreview documentId={productId} />
            </div>
          </WidgetCard>
        </div> */}
      </div>
    </div>
  );
}
