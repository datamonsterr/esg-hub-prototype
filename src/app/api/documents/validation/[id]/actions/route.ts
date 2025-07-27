import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  // Mock actions data
  const mockActions = [
    {
      id: 1,
      title: "Material Sourcing Audit",
      code: "MSA-2024-001",
      type: "sourcing",
      color: "bg-green-100 text-green-800"
    },
    {
      id: 2,
      title: "Carbon Footprint Assessment",
      code: "CFA-2024-002",
      type: "environmental",
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: 3,
      title: "Labor Standards Verification",
      code: "LSV-2024-003",
      type: "social",
      color: "bg-purple-100 text-purple-800"
    },
    {
      id: 4,
      title: "Quality Control Inspection",
      code: "QCI-2024-004",
      type: "quality",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      id: 5,
      title: "Sustainability Certification",
      code: "SC-2024-005",
      type: "certification",
      color: "bg-emerald-100 text-emerald-800"
    },
    {
      id: 6,
      title: "Transportation Optimization",
      code: "TO-2024-006",
      type: "logistics",
      color: "bg-orange-100 text-orange-800"
    }
  ];

  return NextResponse.json(mockActions);
}
