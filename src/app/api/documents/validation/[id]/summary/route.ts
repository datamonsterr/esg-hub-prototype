import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const {id} = await params;
  
  // Mock document summary data
  const mockDocumentSummary = {
    description: "Comprehensive ESG traceability report covering 200+ suppliers across 15 countries, documenting material sourcing, environmental impact, labor standards, and sustainability metrics for Q4 2024.",
    reportingPeriod: "Q4 2024",
    organizationCount: 247,
    keyMetrics: [
      {
        name: "Carbon Emissions",
        value: "2,450",
        unit: "tCO2e",
        category: "Environmental"
      },
      {
        name: "Water Usage",
        value: "125,000",
        unit: "liters",
        category: "Environmental"
      },
      {
        name: "Renewable Energy",
        value: "78",
        unit: "%",
        category: "Environmental"
      },
      {
        name: "Suppliers Audited",
        value: "198",
        unit: "facilities",
        category: "Social"
      },
      {
        name: "Fair Trade Certified",
        value: "85",
        unit: "%",
        category: "Social"
      },
      {
        name: "Local Sourcing",
        value: "42",
        unit: "%",
        category: "Economic"
      }
    ],
    dataQuality: {
      completeness: 92,
      accuracy: 88,
      consistency: 94
    }
  };

  return NextResponse.json(mockDocumentSummary);
}
