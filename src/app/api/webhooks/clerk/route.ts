import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/src/lib/supabase-utils";
import { createUser } from "@/src/lib/user-utils";
import { headers } from "next/headers";
import { Webhook } from "svix";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return createErrorResponse("Webhook secret not configured", 500);
  }

  try {
    // Get headers
    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return createErrorResponse("Missing svix headers", 400);
    }

    // Get the raw body
    const payload = await request.text();

    // Verify the webhook
    const wh = new Webhook(webhookSecret);
    let evt;

    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return createErrorResponse("Invalid webhook signature", 400);
    }

    // Handle the webhook
    const event = evt as any;
    const { id, email_addresses, unsafe_metadata } = event.data;
    const eventType = event.type;

    console.log("Webhook event:", eventType, "for user:", id);

    if (eventType === "user.created") {
      // Check if user has organization info in unsafe_metadata
      // This might be set during invitation flow
      const organizationId = unsafe_metadata?.organizationId;
      const organizationRole = unsafe_metadata?.organizationRole || "employee";

      if (organizationId) {
        try {
          // Create user record in our database
          await createUser({
            clerkId: id,
            organizationId: parseInt(organizationId),
            organizationRole: organizationRole as "admin" | "employee",
            isActive: true,
          });

          console.log(`Created user record for ${id} in organization ${organizationId}`);
        } catch (error) {
          console.error(`Failed to create user record for ${id}:`, error);
          // Don't fail the webhook, just log the error
        }
      } else {
        console.log(`User ${id} created without organization context`);
      }
    }

    return createSuccessResponse({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return createErrorResponse(error.message || "Webhook processing failed", 500);
  }
}
