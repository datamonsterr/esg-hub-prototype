"use client"

import { useParams, useRouter } from "next/navigation"
import { useGetDocument } from "@/src/api/integration"
import { GlobalLoading } from "@/src/components/global-loading"
import { ErrorComponent } from "@/src/components/ui/error"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import { FilePreview } from "@/src/components/data-validation/file-preview"
import { KeyHighlights } from "@/src/components/data-validation/key-highlights"
import { DocumentSummary } from "@/src/components/data-validation/document-summary"
import { Actors } from "@/src/components/data-validation/actors"
import { Actions } from "@/src/components/data-validation/actions"
import { DynamicTable } from "@/src/components/data-validation/dynamic-table"
import { WidgetCard } from "@/src/components/ui/widget-card"

export default function ValidationPage() {
  const router = useRouter()
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const { document: data, isLoading, isError } = useGetDocument(id || "")

  if (isLoading || !id) {
    return <GlobalLoading />
  }

  if (isError || !data) {
    return (
      <ErrorComponent
        title="Error Loading Document"
        description="There was an error loading the document. Please try again later."
      />
    )
  }

  // Add additional validation for data structure
  console.log('Document data check:', {
    hasData: !!data,
    hasSections: !!data.sections,
    sectionsIsArray: Array.isArray(data.sections),
    sectionsLength: data.sections?.length,
    sections: data.sections
  });

  if (!data.sections || !Array.isArray(data.sections)) {
    console.warn('Document sections validation failed:', {
      sections: data.sections,
      sectionsType: typeof data.sections,
      isArray: Array.isArray(data.sections)
    });
    return (
      <ErrorComponent
        title="Invalid Document Structure"
        description="The document data structure is invalid. Please check the document format and try again."
      />
    )
  }

  const filePreviewSection = data?.sections?.find(
    (section) => section.type === "file-preview",
  )
  const keyHighlightsSection = data?.sections?.find(
    (section) => section.type === "key-highlights",
  )
  const documentSummarySection = data?.sections?.find(
    (section) => section.type === "document-summary",
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Data Validation - {data.fileName}</h2>
          <p className="text-sm text-gray-500 mt-1">Review and validate the extracted data from your uploaded file</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="border-border-light rounded-brand bg-transparent"
          >
            <Edit className="h-4 w-4 mr-2" />
            Give Feedback
          </Button>
          <Button className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand">
            Approve and Finalize
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {filePreviewSection && (
            <WidgetCard title="Uploaded File Preview">
              <FilePreview contentUrl={filePreviewSection.contentUrl} />
            </WidgetCard>
          )}
          {documentSummarySection && (
            <WidgetCard title="Document Summary">
              <DocumentSummary contentUrl={documentSummarySection.contentUrl} fileName={data.fileName} />
            </WidgetCard>
          )}
          {keyHighlightsSection && (
            <WidgetCard title="Key Highlights">
              <KeyHighlights contentUrl={keyHighlightsSection.contentUrl} />
            </WidgetCard>
          )}
          <WidgetCard title="Dynamic Table">
            <DynamicTable documentId={id} />
          </WidgetCard>
        </div>
        <div className="space-y-8">
          <WidgetCard title="Actors">
            <Actors documentId={id} />
          </WidgetCard>
          <WidgetCard title="Actions">
            <Actions documentId={id} />
          </WidgetCard>
        </div>
      </div>
    </div>
  )
} 