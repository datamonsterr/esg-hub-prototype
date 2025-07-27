import { endpoints } from "@/src/api/axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  // Mock file preview data
  const mockFilePreview = {
    fileName: "ESG_Traceability_Report_2024.pdf",
    fileSize: "2.4 MB",
    fileType: "pdf",
    url: endpoints.documents.validation.filePreview(parseInt(id)),
  };

  return NextResponse.json(mockFilePreview);
}
