import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Product } from "@/src/types/product";

const dbPath = path.join(process.cwd(), "data/db.json");

async function getDbData() {
  const data = await fs.readFile(dbPath, "utf8");
  return JSON.parse(data);
}

async function writeDbData(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();

    const product = db.products?.find((prod: Product) => prod.id === id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();
    const updatedData = await request.json();

    const productIndex = db.products?.findIndex(
      (prod: Product) => prod.id === id
    );

    if (productIndex === -1 || productIndex === undefined) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update the product while preserving original data
    db.products[productIndex] = {
      ...db.products[productIndex],
      ...updatedData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    await writeDbData(db);

    return NextResponse.json(db.products[productIndex]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();

    const productIndex = db.products?.findIndex(
      (prod: Product) => prod.id === id
    );

    if (productIndex === -1 || productIndex === undefined) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const deletedProduct = db.products.splice(productIndex, 1)[0];
    await writeDbData(db);

    return NextResponse.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
