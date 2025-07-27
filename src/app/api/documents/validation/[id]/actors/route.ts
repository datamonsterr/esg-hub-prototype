import { Actor } from "@/src/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  // Mock actions data
  const mockActors: Actor[] = [
    {
      id: 1,
      title: "Supplier",
      description: "Who provides the raw materials",
      color: "bg-green-100 text-green-800",
      dotColor: "bg-green-500",
    },
    {
      id: 2,
      title: "Manufacturer",
      description: "Who processes the raw materials",
      color: "bg-blue-100 text-blue-800",
      dotColor: "bg-blue-500",
    },
  ];

  return NextResponse.json(mockActors);
}
