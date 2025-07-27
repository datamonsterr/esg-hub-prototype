import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Mock data for the product tree
  const mockProductTree = {
    id,
    name: `Product ${id}`,
    children: [
      { id: `${id}-1`, name: `Child Product ${id}-1` },
      { id: `${id}-2`, name: `Child Product ${id}-2` },
    ],
  };

  return NextResponse.json(mockProductTree);
}
