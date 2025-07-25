import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Mock key highlights data
  const mockKeyHighlights = {
    highlights: [
      {
        title: "Carbon Footprint Reduction",
        detail: "Supply chain emissions reduced by 25% compared to previous year through renewable energy adoption and optimized logistics.",
        percentage: 85,
        status: "success"
      },
      {
        title: "Supplier Compliance Rate",
        detail: "98% of tier-1 suppliers have completed ESG certification audits with satisfactory ratings.",
        percentage: 98,
        status: "success"
      },
      {
        title: "Water Usage Efficiency",
        detail: "Manufacturing processes optimized to reduce water consumption by 15% while maintaining quality standards.",
        percentage: 76,
        status: "info"
      },
      {
        title: "Waste Reduction Progress",
        detail: "62% waste diversion from landfills achieved through improved recycling and circular economy initiatives.",
        percentage: 62,
        status: "warning"
      },
      {
        title: "Labor Standards Verification",
        detail: "100% of manufacturing facilities audited for labor standards compliance including fair wages and safe working conditions.",
        percentage: 100,
        status: "success"
      }
    ]
  };

  return NextResponse.json(mockKeyHighlights);
}
