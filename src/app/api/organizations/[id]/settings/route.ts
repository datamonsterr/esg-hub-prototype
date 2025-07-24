import { NextRequest, NextResponse } from "next/server";
import {
  getDbData,
  writeDbData,
  createErrorResponse,
  createSuccessResponse,
  addTimestamps,
} from "@/src/lib/api-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId } = await params;
    const db = await getDbData();

    if (!db["organization-settings"]) {
      db["organization-settings"] = [];
    }

    // Find settings for this organization or return defaults
    const settings = db["organization-settings"].find(
      (setting: any) => setting.organizationId === organizationId
    ) || {
      organizationId,
      notifications: {
        emailNotifications: true,
        traceabilityUpdates: true,
        membershipChanges: true,
        systemAlerts: false,
      },
      privacy: {
        allowDataSharing: false,
        publicProfile: true,
        allowAnalytics: true,
      },
      security: {
        requireTwoFactor: false,
        sessionTimeout: 24,
        allowApiAccess: true,
      },
      collaboration: {
        allowGuestAccess: false,
        autoApproveRequests: false,
        shareTraceabilityData: true,
      },
    };

    return createSuccessResponse(settings);
  } catch (error) {
    console.error("Error fetching organization settings:", error);
    return createErrorResponse("Failed to fetch organization settings");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId } = await params;
    const settingsData = await request.json();
    const db = await getDbData();

    if (!db["organization-settings"]) {
      db["organization-settings"] = [];
    }

    const settingsIndex = db["organization-settings"].findIndex(
      (setting: any) => setting.organizationId === organizationId
    );

    const updatedSettings = addTimestamps({
      organizationId,
      ...settingsData,
    });

    if (settingsIndex >= 0) {
      // Update existing settings
      db["organization-settings"][settingsIndex] = {
        ...db["organization-settings"][settingsIndex],
        ...updatedSettings,
      };
    } else {
      // Create new settings
      db["organization-settings"].push(updatedSettings);
    }

    await writeDbData(db);

    return createSuccessResponse(updatedSettings);
  } catch (error) {
    console.error("Error updating organization settings:", error);
    return createErrorResponse("Failed to update organization settings");
  }
}
