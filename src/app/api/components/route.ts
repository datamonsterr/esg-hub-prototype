import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

    let components = db.components || [];

    // Filter by query parameters if provided
    const productId = searchParams.get("productId");
    const organizationId = searchParams.get("organizationId");
    const parentId = searchParams.get("parentId");
    const type = searchParams.get("type");

    if (productId) {
      components = components.filter(
        (comp: any) => comp.productId === productId
      );
    }

    if (organizationId) {
      components = components.filter(
        (comp: any) => comp.organizationId === organizationId
      );
    }

    if (parentId) {
      components = components.filter((comp: any) => comp.parentId === parentId);
    }

    if (type) {
      components = components.filter((comp: any) => comp.type === type);
    }

    return NextResponse.json(components);
  } catch (error) {
    console.error("Error fetching components:", error);
    return NextResponse.json(
      { error: "Failed to fetch components" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDbData();
    const newComponent = await request.json();

    // Generate ID if not provided
    if (!newComponent.id) {
      newComponent.id = `comp-${Date.now().toString(36)}`;
    }

    // Add timestamps
    newComponent.createdAt = new Date().toISOString();
    newComponent.updatedAt = new Date().toISOString();

    // Set default data completeness if not provided
    if (!newComponent.dataCompleteness) {
      newComponent.dataCompleteness = 0;
    }

    if (!newComponent.missingDataFields) {
      newComponent.missingDataFields = [];
    }

    if (!db.components) {
      db.components = [];
    }

    db.components.push(newComponent);
    await writeDbData(db);

    return NextResponse.json(newComponent, { status: 201 });
  } catch (error) {
    console.error("Error creating component:", error);
    return NextResponse.json(
      { error: "Failed to create component" },
      { status: 500 }
    );
  }
}
