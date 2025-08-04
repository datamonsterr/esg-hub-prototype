import { z } from 'zod';
import crypto from 'crypto';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { PendingInvitation } from '../../types/user';
import { supabaseAdmin } from '../../lib/supabase';

const sendInvitationSchema = z.object({
  email: z.string().email(),
  organizationRole: z.enum(['admin', 'employee']).optional(),
  expiresInDays: z.number().optional(),
});

const acceptInvitationResponseSchema = z.object({
  organizationId: z.string(),
  organizationRole: z.enum(['admin', 'employee']),
  organizationName: z.string(),
  message: z.string(),
});

const sendInvitationResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  organizationName: z.string(),
  organizationRole: z.string(),
  expiresAt: z.string(),
  message: z.string(),
});

// Helper function to transform database invitation to PendingInvitation type
function transformInvitation(invitation: any): PendingInvitation {
  return {
    id: invitation.id,
    email: invitation.email,
    organizationId: invitation.organization_id,
    organizationName: invitation.organizations?.name || 'Unknown Organization',
    organizationRole: invitation.role,
    invitedBy: {
      name: invitation.users ? `${invitation.users.first_name || ''} ${invitation.users.last_name || ''}`.trim() : 'Unknown',
      email: invitation.users?.email || 'unknown@email.com'
    },
    status: invitation.status,
    token: invitation.token,
    expiresAt: invitation.expires_at,
    createdAt: invitation.created_at
  };
}

export const onboardingRouter = createTRPCRouter({
  getPendingInvitations: protectedProcedure
    .query(async ({ ctx }): Promise<PendingInvitation[]> => {
      const { data, error } = await supabaseAdmin
        .from('organization_invites')
        .select(`
          *,
          organizations!organization_invites_organization_id_fkey(name),
          users!organization_invites_invited_by_fkey(first_name, last_name, email)
        `)
        .eq('email', ctx.userContext.email)
        .eq('status', 'pending');

      if (error) {
        throw new Error(`Failed to fetch invitations: ${error.message}`);
      }

      return (data || []).map(transformInvitation);
    }),

  acceptInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { data: invitation, error: fetchError } = await supabaseAdmin
        .from('organization_invites')
        .select('*')
        .eq('id', input.invitationId)
        .eq('email', ctx.userContext.email)
        .eq('status', 'pending')
        .single();

      if (fetchError || !invitation) {
        throw new Error('Invitation not found or already processed');
      }

      // Update invitation status
      const { error: updateError } = await supabaseAdmin
        .from('organization_invites')
        .update({ status: 'accepted' })
        .eq('id', input.invitationId);

      if (updateError) {
        throw new Error(`Failed to accept invitation: ${updateError.message}`);
      }

      // Update user's organization
      const { error: userUpdateError } = await supabaseAdmin
        .from('users')
        .update({ 
          organization_id: invitation.organization_id,
          organization_role: invitation.role 
        })
        .eq('id', ctx.userContext.userId);

      if (userUpdateError) {
        throw new Error(`Failed to update user: ${userUpdateError.message}`);
      }

      // Get organization name
      const { data: organization } = await supabaseAdmin
        .from('organizations')
        .select('name')
        .eq('id', invitation.organization_id)
        .single();

      return {
        organizationId: invitation.organization_id.toString(),
        organizationRole: invitation.role as 'admin' | 'employee',
        organizationName: organization?.name || 'Unknown Organization',
        message: 'Invitation accepted successfully'
      };
    }),

  sendInvitation: protectedProcedure
    .input(sendInvitationSchema)
    .mutation(async ({ input, ctx }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays || 7));

      // Generate a unique token for the invitation
      const token = crypto.randomUUID();

      const { data, error } = await supabaseAdmin
        .from('organization_invites')
        .insert({
          organization_id: ctx.userContext.organizationId,
          email: input.email,
          role: input.organizationRole || 'employee',
          expires_at: expiresAt.toISOString(),
          status: 'pending',
          invited_by: ctx.userContext.userId,
          token: token
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to send invitation: ${error.message}`);
      }

      return {
        id: data.id.toString(),
        email: input.email,
        organizationName: ctx.userContext.organization?.name || 'Unknown',
        organizationRole: input.organizationRole || 'employee',
        expiresAt: expiresAt.toISOString(),
        message: 'Invitation sent successfully'
      };
    }),

  getInvitationsByEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }): Promise<PendingInvitation[]> => {
      const { data, error } = await supabaseAdmin
        .from('organization_invites')
        .select(`
          *,
          organizations!organization_invites_organization_id_fkey(name),
          users!organization_invites_invited_by_fkey(first_name, last_name, email)
        `)
        .eq('email', input.email)
        .eq('status', 'pending');

      if (error) {
        throw new Error(`Failed to fetch invitations: ${error.message}`);
      }

      return (data || []).map(transformInvitation);
    }),

  revokeInvitation: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabaseAdmin
        .from('organization_invites')
        .update({ status: 'revoked' })
        .eq('email', input.email)
        .eq('organization_id', ctx.userContext.organizationId);

      if (error) {
        throw new Error(`Failed to revoke invitation: ${error.message}`);
      }

      return { message: 'Invitation revoked successfully' };
    }),

  getOrganizationInvitations: protectedProcedure
    .query(async ({ ctx }): Promise<PendingInvitation[]> => {
      const { data, error } = await supabaseAdmin
        .from('organization_invites')
        .select(`
          *,
          organizations!organization_invites_organization_id_fkey(name),
          users!organization_invites_invited_by_fkey(first_name, last_name, email)
        `)
        .eq('organization_id', ctx.userContext.organizationId);

      if (error) {
        throw new Error(`Failed to fetch organization invitations: ${error.message}`);
      }

      return (data || []).map(transformInvitation);
    }),
});
