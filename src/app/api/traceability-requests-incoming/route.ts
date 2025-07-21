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

    let requests = db["traceability-requests-incoming"] || [];

    // Filter by query parameters if provided
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const targetOrganizationId = searchParams.get("targetOrganizationId");
    const requestingOrganizationId = searchParams.get(
      "requestingOrganizationId"
    );

    if (status) {
      requests = requests.filter((req: any) => req.status === status);
    }

    if (priority) {
      requests = requests.filter((req: any) => req.priority === priority);
    }

    if (targetOrganizationId) {
      requests = requests.filter(
        (req: any) => req.targetOrganizationId === targetOrganizationId
      );
    }

    if (requestingOrganizationId) {
      requests = requests.filter(
        (req: any) => req.requestingOrganizationId === requestingOrganizationId
      );
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching traceability requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch traceability requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDbData();
    const newRequest = await request.json();

    // Generate ID if not provided
    if (!newRequest.id) {
      newRequest.id = `tr-inc-${Date.now().toString(36)}`;
    }

    // Add timestamps
    newRequest.createdAt = new Date().toISOString();
    newRequest.updatedAt = new Date().toISOString();

    // Set default status if not provided
    if (!newRequest.status) {
      newRequest.status = "pending";
    }

    if (!db["traceability-requests-incoming"]) {
      db["traceability-requests-incoming"] = [];
    }

    db["traceability-requests-incoming"].push(newRequest);
    await writeDbData(db);

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating traceability request:", error);
    return NextResponse.json(
      { error: "Failed to create traceability request" },
      { status: 500 }
    );
  }
}
