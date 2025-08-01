import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  // Mock processed document data
  const mockProcessedDocument = {
    id,
    fileName: "ESG_Traceability_Report_2024.pdf",
    description: `Processed document: ESG_Traceability_Report_2024.pdf`,
    sections: [
      {
        title: "File Preview",
        type: "file-preview",
        contentUrl: `/api/documents/validation/${id}/file-preview`
      },
      {
        title: "Document Summary",
        type: "document-summary",
        contentUrl: `/api/documents/validation/${id}/summary`
      }
    ],
    status: "processed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return NextResponse.json(mockProcessedDocument);
}
