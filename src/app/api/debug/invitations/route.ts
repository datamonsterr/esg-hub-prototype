import { NextRequest, NextResponse } from "next/server";
import { getDbData } from "@/src/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const db = await getDbData();
    const allInvitations = db["pending-invitations"] || [];

    const result: any = {
      totalInvitations: allInvitations.length,
      requestedEmail: email,
      allInvitations: allInvitations.map((inv: any) => ({
        id: inv.id,
        email: inv.email,
        organizationName: inv.organizationName,
        status: inv.status,
        organizationRole: inv.organizationRole,
      })),
    };

    if (email) {
      // Test wildcard matching
      const emailMatches = (inviteEmail: string, userEmail: string) => {
        if (inviteEmail === userEmail) return true;

        if (inviteEmail.includes("*")) {
          const pattern = inviteEmail.replace("*", ".*");
          const regex = new RegExp(`^${pattern}$`, "i");
          return regex.test(userEmail);
        }

        return false;
      };

      const matchingInvitations = allInvitations.filter(
        (inv: any) => inv.status === "pending" && emailMatches(inv.email, email)
      );

      result.matchingInvitations = matchingInvitations;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data" },
      { status: 500 }
    );
  }
}
