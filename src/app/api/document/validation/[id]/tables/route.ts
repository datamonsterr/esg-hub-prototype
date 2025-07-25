import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Mock dynamic table data
  const mockTableData = [
    {
      id: "1",
      supplier: "GreenTech Materials Ltd",
      material: "Organic Cotton",
      quantity: "5,000 kg",
      certification: "GOTS Certified",
      carbonFootprint: "2.1 tCO2e",
      waterUsage: "1,250 L",
      location: "Indonesia",
      lastAudit: "2024-06-15"
    },
    {
      id: "2",
      supplier: "EcoSustain Manufacturing",
      material: "Recycled Polyester",
      quantity: "3,200 kg",
      certification: "GRS Certified",
      carbonFootprint: "1.8 tCO2e",
      waterUsage: "890 L",
      location: "Vietnam",
      lastAudit: "2024-05-28"
    },
    {
      id: "3",
      supplier: "Natural Dyes Co",
      material: "Plant-based Dyes",
      quantity: "150 L",
      certification: "OEKO-TEX",
      carbonFootprint: "0.3 tCO2e",
      waterUsage: "75 L",
      location: "India",
      lastAudit: "2024-07-10"
    },
    {
      id: "4",
      supplier: "Sustainable Threads",
      material: "Hemp Fiber",
      quantity: "2,800 kg",
      certification: "Organic",
      carbonFootprint: "1.2 tCO2e",
      waterUsage: "620 L",
      location: "China",
      lastAudit: "2024-06-30"
    },
    {
      id: "5",
      supplier: "Green Packaging Solutions",
      material: "Biodegradable Packaging",
      quantity: "10,000 units",
      certification: "FSC Certified",
      carbonFootprint: "0.8 tCO2e",
      waterUsage: "200 L",
      location: "Thailand",
      lastAudit: "2024-07-05"
    }
  ];

  const columns = [
    "supplier",
    "material", 
    "quantity",
    "certification",
    "carbonFootprint",
    "waterUsage",
    "location",
    "lastAudit"
  ];

  return NextResponse.json({
    data: mockTableData,
    columns: columns,
    title: "Supply Chain Traceability Data"
  });
}
