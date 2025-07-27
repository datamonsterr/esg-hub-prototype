"use client"

import { GlobalLoading } from "@/src/components/global-loading"
import { Button } from "@/src/components/ui/button"
import { ErrorComponent } from "@/src/components/ui/error"
import { ExtractedProductTree } from "@/src/components/validation/extracted-product-tree"
import { FilePreview } from "@/src/components/validation/file-preview"
import { DocumentSummary } from "@/src/components/validation/document-summary"
import { KeyHighlights } from "@/src/components/validation/key-highlights"
import { Actions } from "@/src/components/validation/actions"
import { Actors } from "@/src/components/validation/actors"
import { DynamicTable } from "@/src/components/validation/dynamic-table"
import { Edit } from "lucide-react"
import { Product } from "@/src/types/product"
import { WidgetCard } from "@/src/components/ui/widget-card"

export default function Validation({ documentId, selectedProduct }: { documentId: number, selectedProduct: Product | null }) {
  
  const mockProduct: Product = {
    id: `doc-${documentId}`,
    organizationId: "org-001",
    name: "Extracted Product Tree",
    type: "final_product",
    description: "Mock extracted product tree",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentId: null,
    children: [
      {
        id: "product-001",
        organizationId: "org-001",
        name: `Child Product ${documentId}-1`,
        type: "component",
        description: "Child product",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: documentId,
        children: [],
        quantity: 0,
        unit: "",
        metadata: undefined,
        dataCompleteness: 0
      },
      {
        id: "product-002",
        organizationId: "org-001",
        name: `Child Product ${documentId}-2`,
        type: "component",
        description: "Child product",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: documentId,
        children: [],
        quantity: 0,
        unit: "",
        metadata: undefined,
        dataCompleteness: 0
      }
    ],
    quantity: 0,
    unit: "",
    metadata: undefined,
    dataCompleteness: 0
  };


  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Data Validation - Extracted Product Tree</h2>
          <p className="text-sm text-gray-500 mt-1">Review and validate the extracted product/component tree from your uploaded file</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-border-light rounded-brand bg-transparent">
            <Edit className="h-4 w-4 mr-2" />
            Give Feedback
          </Button>
          <Button className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand">
            Approve and Finalize
          </Button>
        </div>
      </div>
      <div className="flex-1 flex gap-8 px-8 pb-8">
        {/* Left Panel: 2/3 width */}
        <div className="w-2/3 flex flex-col space-y-6">
          <WidgetCard title="Product Tree">
            <ExtractedProductTree tree={mockProduct} onChange={() => {}} />
          </WidgetCard>
          <WidgetCard title="File Preview">
            <FilePreview documentId={documentId} />
          </WidgetCard>
          <WidgetCard title="Document Summary">
            <DocumentSummary documentId={documentId.toString()} />
          </WidgetCard>
          <WidgetCard title="Key Highlights">
            <KeyHighlights documentId={documentId.toString()} />
          </WidgetCard>
          <WidgetCard title="Dynamic Table">
            <DynamicTable documentId={documentId.toString()} />
          </WidgetCard>
        </div>
        {/* Right Panel: 1/3 width */}
        <div className="w-1/3 flex flex-col space-y-6">
          <WidgetCard title="Actors">
            <Actors documentId={documentId.toString()} />
          </WidgetCard>
          <WidgetCard title="Actions">
            <Actions documentId={documentId.toString()} />
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}