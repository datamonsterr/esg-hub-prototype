import { z } from 'zod';
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
  organizationName: z.string().optional(),
  message: z.string().optional(),
});

const sendInvitationResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  organizationName: z.string(),
  organizationRole: z.string(),
  expiresAt: z.string(),
  message: z.string(),
});

export const onboardingRouter = createTRPCRouter({
  getPendingInvitations: protectedProcedure
    .query(async ({ ctx }): Promise<PendingInvitation[]> => {
      const { data, error } = await supabaseAdmin
        .from('organization_invites')
        .select('*')
        .eq('invited_user_id', ctx.userContext.userId)
        .eq('status', 'pending');

      if (error) {
        throw new Error(`Failed to fetch invitations: ${error.message}`);
      }

      return data || [];
    }),

  acceptInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { data: invitation, error: fetchError } = await supabaseAdmin
        .from('organization_invites')
        .select('*')
        .eq('id', input.invitationId)
        .eq('invited_user_id', ctx.userContext.userId)
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

      return {
        organizationId: invitation.organization_id.toString(),
        organizationRole: invitation.role as 'admin' | 'employee',
        message: 'Invitation accepted successfully'
      };
    }),

  sendInvitation: protectedProcedure
    .input(sendInvitationSchema)
    .mutation(async ({ input, ctx }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays || 7));

      const { data, error } = await supabaseAdmin
        .from('organization_invites')
        .insert({
          organization_id: ctx.userContext.organizationId,
          invited_email: input.email,
          role: input.organizationRole || 'employee',
          expires_at: expiresAt.toISOString(),
          status: 'pending',
          invited_by_user_id: ctx.userContext.userId
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
        .select('*')
        .eq('invited_email', input.email)
        .eq('status', 'pending');

      if (error) {
        throw new Error(`Failed to fetch invitations: ${error.message}`);
      }

      return data || [];
    }),

  revokeInvitation: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabaseAdmin
        .from('organization_invites')
        .update({ status: 'revoked' })
        .eq('invited_email', input.email)
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
        .select('*')
        .eq('organization_id', ctx.userContext.organizationId);

      if (error) {
        throw new Error(`Failed to fetch organization invitations: ${error.message}`);
      }

      return data || [];
    }),
});
