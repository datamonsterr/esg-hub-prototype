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
  params: Promise<{ collection: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { collection } = await params;
    const db = await getDbData();

    if (!db[collection]) {
      return NextResponse.json(
        { error: `Collection '${collection}' not found` },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    let data = db[collection];

    // Handle arrays of data with filtering
    if (Array.isArray(data)) {
      // Apply filters from query parameters
      for (const [key, value] of searchParams.entries()) {
        if (
          key !== "_limit" &&
          key !== "_page" &&
          key !== "_sort" &&
          key !== "_order"
        ) {
          data = data.filter((item: any) => {
            if (typeof item[key] === "string") {
              return item[key].toLowerCase().includes(value.toLowerCase());
            }
            return item[key] === value;
          });
        }
      }

      // Handle sorting
      const sortBy = searchParams.get("_sort");
      const order = searchParams.get("_order") || "asc";
      if (sortBy) {
        data.sort((a: any, b: any) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];
          if (order === "desc") {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Handle pagination
      const limit = parseInt(searchParams.get("_limit") || "0");
      const page = parseInt(searchParams.get("_page") || "1");
      if (limit > 0) {
        const start = (page - 1) * limit;
        const end = start + limit;
        data = data.slice(start, end);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching ${params}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { collection } = await params;
    const db = await getDbData();
    const newItem = await request.json();

    if (!db[collection]) {
      db[collection] = [];
    }

    // Generate ID if not provided and if collection is an array
    if (Array.isArray(db[collection]) && !newItem.id) {
      newItem.id = `${collection.slice(0, 3)}-${Date.now().toString(36)}`;
    }

    // Add timestamps if it's an array item
    if (Array.isArray(db[collection])) {
      newItem.createdAt = new Date().toISOString();
      newItem.updatedAt = new Date().toISOString();
      db[collection].push(newItem);
    } else {
      // If it's an object, merge the new data
      db[collection] = { ...db[collection], ...newItem };
    }

    await writeDbData(db);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error(`Error creating item in ${params}:`, error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { collection } = await params;
    const db = await getDbData();
    const updatedData = await request.json();

    if (!db[collection]) {
      return NextResponse.json(
        { error: `Collection '${collection}' not found` },
        { status: 404 }
      );
    }

    // If it's an object collection, update the entire object
    if (!Array.isArray(db[collection])) {
      db[collection] = { ...db[collection], ...updatedData };
      await writeDbData(db);
      return NextResponse.json(db[collection]);
    }

    return NextResponse.json(
      { error: "PUT method requires specific item ID for array collections" },
      { status: 400 }
    );
  } catch (error) {
    console.error(`Error updating ${params}:`, error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 }
    );
  }
}
