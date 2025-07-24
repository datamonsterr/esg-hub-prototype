import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data/db.json");

export async function getDbData() {
  try {
    const data = await fs.readFile(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file:", error);
    throw new Error("Failed to read database");
  }
}

export async function writeDbData(data: any) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to database file:", error);
    throw new Error("Failed to write to database");
  }
}

export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function generateId(prefix: string = "item"): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function addTimestamps(item: any): any {
  const now = new Date().toISOString();
  return {
    ...item,
    createdAt: item.createdAt || now,
    updatedAt: now,
  };
}

export function applyFilters(
  data: any[],
  searchParams: URLSearchParams
): any[] {
  let filtered = [...data];

  for (const [key, value] of searchParams.entries()) {
    // Skip pagination, sorting params, and email (used for invitation matching, not filtering)
    if (["_limit", "_page", "_sort", "_order", "email"].includes(key)) {
      continue;
    }

    filtered = filtered.filter((item: any) => {
      if (typeof item[key] === "string") {
        return item[key].toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(item[key])) {
        return item[key].includes(value);
      }
      return (
        item[key] === value ||
        item[key] === Number(value) ||
        item[key] === (value === "true")
      );
    });
  }

  return filtered;
}

export function applySorting(
  data: any[],
  searchParams: URLSearchParams
): any[] {
  const sortBy = searchParams.get("_sort");
  const order = searchParams.get("_order") || "asc";

  if (!sortBy) return data;

  return data.sort((a: any, b: any) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return order === "desc" ? 1 : -1;
    if (bVal == null) return order === "desc" ? -1 : 1;

    if (order === "desc") {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
}

export function applyPagination(
  data: any[],
  searchParams: URLSearchParams
): any[] {
  const limit = parseInt(searchParams.get("_limit") || "0");
  const page = parseInt(searchParams.get("_page") || "1");

  if (limit <= 0) return data;

  const start = (page - 1) * limit;
  const end = start + limit;

  return data.slice(start, end);
}

export function processQueryParams(
  data: any[],
  searchParams: URLSearchParams
): any[] {
  if (!Array.isArray(data)) return data;

  let processed = applyFilters(data, searchParams);
  processed = applySorting(processed, searchParams);
  processed = applyPagination(processed, searchParams);

  return processed;
}
