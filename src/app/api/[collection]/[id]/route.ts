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

type RouteParams = {
  params: Promise<{ collection: string; id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { collection, id } = await params;
    const db = await getDbData();

    if (!db[collection] || !Array.isArray(db[collection])) {
      return NextResponse.json(
        { error: `Collection '${collection}' not found or not an array` },
        { status: 404 }
      );
    }

    const item = db[collection].find((item: any) => item.id === id);

    if (!item) {
      return NextResponse.json(
        { error: `Item with id '${id}' not found in '${collection}'` },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error(`Error fetching item from ${params}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { collection, id } = await params;
    const db = await getDbData();
    const updatedData = await request.json();

    if (!db[collection] || !Array.isArray(db[collection])) {
      return NextResponse.json(
        { error: `Collection '${collection}' not found or not an array` },
        { status: 404 }
      );
    }

    const itemIndex = db[collection].findIndex((item: any) => item.id === id);

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: `Item with id '${id}' not found in '${collection}'` },
        { status: 404 }
      );
    }

    // Update the item while preserving original data
    db[collection][itemIndex] = {
      ...db[collection][itemIndex],
      ...updatedData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    await writeDbData(db);

    return NextResponse.json(db[collection][itemIndex]);
  } catch (error) {
    console.error(`Error updating item in ${params}:`, error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { collection, id } = await params;
    const db = await getDbData();

    if (!db[collection] || !Array.isArray(db[collection])) {
      return NextResponse.json(
        { error: `Collection '${collection}' not found or not an array` },
        { status: 404 }
      );
    }

    const itemIndex = db[collection].findIndex((item: any) => item.id === id);

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: `Item with id '${id}' not found in '${collection}'` },
        { status: 404 }
      );
    }

    const deletedItem = db[collection].splice(itemIndex, 1)[0];
    await writeDbData(db);

    return NextResponse.json({
      message: `Item deleted successfully from '${collection}'`,
      item: deletedItem,
    });
  } catch (error) {
    console.error(`Error deleting item from ${params}:`, error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
