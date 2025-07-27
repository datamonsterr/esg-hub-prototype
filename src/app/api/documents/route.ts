import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Mock processed document data
  const mockProcessedDocument = {
    id,
    fileName: "ESG_Traceability_Report_2024.pdf",
    description: `Processed document: ESG_Traceability_Report_2024.pdf`,
    actors: [
      {
        id: 1,
        title: "Primary Supplier",
        description: "GreenTech Materials Ltd - Renewable fiber supplier",
        color: "bg-blue-50 text-blue-900",
        dotColor: "bg-blue-500"
      },
      {
        id: 2,
        title: "Manufacturing Partner", 
        description: "EcoSustain Manufacturing Corp",
        color: "bg-green-50 text-green-900",
        dotColor: "bg-green-500"
      },
      {
        id: 3,
        title: "Certification Body",
        description: "Global ESG Auditing Services",
        color: "bg-purple-50 text-purple-900",
        dotColor: "bg-purple-500"
      }
    ],
    available_actions: [
      {
        id: 1,
        title: "Material Sourcing Audit",
        code: "MSA-2024-001",
        type: "sourcing",
        color: "bg-green-100 text-green-800"
      },
      {
        id: 2,
        title: "Carbon Assessment", 
        code: "CFA-2024-002",
        type: "environmental",
        color: "bg-blue-100 text-blue-800"
      },
      {
        id: 3,
        title: "Labor Standards Check",
        code: "LSV-2024-003", 
        type: "social",
        color: "bg-purple-100 text-purple-800"
      }
    ],
    sections: [
      {
        title: "File Preview",
        type: "file-preview",
        contentUrl: `/file-previews/${id}`
      },
      {
        title: "Key Highlights", 
        type: "key-highlights",
        contentUrl: `/key-highlights-data/${id}`
      },
      {
        title: "Document Summary",
        type: "document-summary", 
        contentUrl: `/document-summary/${id}`
      }
    ]
  };

  return NextResponse.json(mockProcessedDocument);
}
