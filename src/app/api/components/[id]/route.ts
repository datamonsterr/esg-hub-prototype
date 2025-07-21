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
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();

    const component = db.components?.find((comp: any) => comp.id === id);

    if (!component) {
      return NextResponse.json(
        { error: "Component not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(component);
  } catch (error) {
    console.error("Error fetching component:", error);
    return NextResponse.json(
      { error: "Failed to fetch component" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();
    const updatedData = await request.json();

    const componentIndex = db.components?.findIndex(
      (comp: any) => comp.id === id
    );

    if (componentIndex === -1 || componentIndex === undefined) {
      return NextResponse.json(
        { error: "Component not found" },
        { status: 404 }
      );
    }

    // Update the component while preserving original data
    db.components[componentIndex] = {
      ...db.components[componentIndex],
      ...updatedData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    await writeDbData(db);

    return NextResponse.json(db.components[componentIndex]);
  } catch (error) {
    console.error("Error updating component:", error);
    return NextResponse.json(
      { error: "Failed to update component" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDbData();

    const componentIndex = db.components?.findIndex(
      (comp: any) => comp.id === id
    );

    if (componentIndex === -1 || componentIndex === undefined) {
      return NextResponse.json(
        { error: "Component not found" },
        { status: 404 }
      );
    }

    const deletedComponent = db.components.splice(componentIndex, 1)[0];
    await writeDbData(db);

    return NextResponse.json({
      message: "Component deleted successfully",
      component: deletedComponent,
    });
  } catch (error) {
    console.error("Error deleting component:", error);
    return NextResponse.json(
      { error: "Failed to delete component" },
      { status: 500 }
    );
  }
}
