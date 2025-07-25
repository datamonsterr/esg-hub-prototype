import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUserContext,
  handleDatabaseError,
  sanitizeData,
} from "@/src/lib/supabase-utils";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const userContext = await getCurrentUserContext();

    // Get invites for user's organization (admins only)
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    const { data: invites, error } = await supabaseAdmin
      .from('organization_invites')
      .select(`
        id,
        email,
        organization_id,
        organization_role,
        invited_by,
        status,
        expires_at,
        created_at,
        organizations:organization_id (
          id,
          name
        )
      `)
      .eq('organization_id', userContext.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(invites || []);
  } catch (error) {
    console.error("Error fetching invites:", error);
    return createErrorResponse("Failed to fetch invites");
  }
}

export async function POST(request: NextRequest) {
  try {
    const inviteData = await request.json();
    const userContext = await getCurrentUserContext();

    // Only admins can send invites
    if (userContext.organizationRole !== 'admin') {
      return createErrorResponse("Access denied: Admin role required", 403);
    }

    const { email, organizationRole = 'member' } = inviteData;

    if (!email || !email.includes('@')) {
      return createErrorResponse("Valid email is required", 400);
    }

    // Check if user already has a pending invite
    const { data: existingInvite } = await supabaseAdmin
      .from('organization_invites')
      .select('id')
      .eq('email', email)
      .eq('organization_id', userContext.organizationId)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return createErrorResponse("User already has a pending invitation", 409);
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { data: newInvite, error } = await supabaseAdmin
      .from('organization_invites')
      .insert({
        email: email.toLowerCase().trim(),
        organization_id: userContext.organizationId,
        organization_role: organizationRole,
        invited_by: userContext.userId,
        status: 'pending',
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select(`
        id,
        email,
        organization_id,
        organization_role,
        invited_by,
        status,
        expires_at,
        created_at,
        organizations:organization_id (
          id,
          name
        )
      `)
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return createSuccessResponse(newInvite, 201);
  } catch (error) {
    console.error("Error sending invite:", error);
    return createErrorResponse("Failed to send invite");
  }
}
