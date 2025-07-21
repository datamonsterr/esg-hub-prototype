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

export async function GET(request: NextRequest) {
  try {
    const db = await getDbData();
    const searchParams = request.nextUrl.searchParams;

    let products = db.products || [];

    // Filter by query parameters if provided
    const organizationId = searchParams.get("organizationId");
    const category = searchParams.get("category");
    const sku = searchParams.get("sku");

    if (organizationId) {
      products = products.filter(
        (product: Product) => product.organizationId === organizationId
      );
    }

    if (category) {
      products = products.filter(
        (product: Product) => product.category === category
      );
    }

    if (sku) {
      products = products.filter((product: Product) =>
        product.sku?.toLowerCase().includes(sku.toLowerCase())
      );
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDbData();
    const newProduct = await request.json();

    // Generate ID if not provided
    if (!newProduct.id) {
      newProduct.id = `prod-${Date.now().toString(36)}`;
    }

    // Add timestamps
    newProduct.createdAt = new Date().toISOString();
    newProduct.updatedAt = new Date().toISOString();

    // Set default data completeness if not provided
    if (!newProduct.dataCompleteness) {
      newProduct.dataCompleteness = 0;
    }

    if (!newProduct.missingDataFields) {
      newProduct.missingDataFields = [];
    }

    if (!db.products) {
      db.products = [];
    }

    db.products.push(newProduct);
    await writeDbData(db);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
