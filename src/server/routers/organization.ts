import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { supabaseAdmin } from '@/src/lib/supabase';
import { transformFromDb } from '@/src/types/server-transforms';
import { addCreateTimestamps, sanitizeData } from '@/src/lib/supabase-utils';
import { v4 as uuidv4 } from 'uuid';

export const organizationRouter = createTRPCRouter({
  // Get organizations (for admin or multi-org users)
  getOrganizations: protectedProcedure
    .query(async ({ ctx }) => {
      const userContext = ctx.userContext!;

      const { data: organizations, error } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', userContext.organizationId);

      if (error) {
        throw new Error('Failed to fetch organizations');
      }

      return organizations?.map((org: any) => transformFromDb(org)) || [];
    }),

  // Get organization by ID
  getOrganizationById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id } = input;

      // Users can only access their own organization
      if (id !== userContext.organizationId) {
        throw new Error('Access denied');
      }

      const { data: organization, error } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Organization not found');
        }
        throw new Error('Failed to fetch organization');
      }

      return transformFromDb(organization);
    }),

  // Update organization
  updateOrganization: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          website: z.string().optional(),
          description: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id, data } = input;

      // Users can only update their own organization
      if (id !== userContext.organizationId) {
        throw new Error('Access denied');
      }

      // Check if user has admin role
      const { data: currentUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userContext.userId)
        .single();

      if (userError || currentUser.role !== 'admin') {
        throw new Error('Insufficient permissions to update organization');
      }

      const { data: organization, error } = await supabaseAdmin
        .from('organizations')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update organization');
      }

      return transformFromDb(organization);
    }),

  // Get organization members
  getMembers: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { organizationId } = input;

      // Users can only access their own organization's members
      if (organizationId !== userContext.organizationId) {
        throw new Error('Access denied');
      }

      const { data: members, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) {
        throw new Error('Failed to fetch organization members');
      }

      return members?.map((member: any) => transformFromDb(member)) || [];
    }),

  // Get organization invites
  getInvites: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { organizationId } = input;

      // Users can only access their own organization's invites
      if (organizationId !== userContext.organizationId) {
        throw new Error('Access denied');
      }

      const { data: invites, error } = await supabaseAdmin
        .from('organization_invites')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) {
        throw new Error('Failed to fetch organization invites');
      }

      return invites?.map((invite: any) => transformFromDb(invite)) || [];
    }),

  // Send organization invite
  sendInvite: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(['admin', 'manager', 'member']),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { email, role, message } = input;

      // Check if current user has permission to send invites
      const { data: currentUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userContext.userId)
        .single();

      if (userError || !['admin', 'manager'].includes(currentUser.role)) {
        throw new Error('Insufficient permissions to send invites');
      }

      const inviteData = {
        id: uuidv4(),
        organizationId: userContext.organizationId,
        email,
        role,
        message,
        status: 'pending' as const,
        invitedBy: userContext.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };

      const sanitizedData = addCreateTimestamps(sanitizeData(inviteData));

      const { data: invite, error } = await supabaseAdmin
        .from('organization_invites')
        .insert(sanitizedData)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to send organization invite');
      }

      return transformFromDb(invite);
    }),

  // Cancel organization invite
  cancelInvite: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        inviteId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { organizationId, inviteId } = input;

      // Users can only cancel invites for their own organization
      if (organizationId !== userContext.organizationId) {
        throw new Error('Access denied');
      }

      // Check if current user has permission to cancel invites
      const { data: currentUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userContext.userId)
        .single();

      if (userError || !['admin', 'manager'].includes(currentUser.role)) {
        throw new Error('Insufficient permissions to cancel invites');
      }

      const { data: invite, error } = await supabaseAdmin
        .from('organization_invites')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to cancel organization invite');
      }

      return transformFromDb(invite);
    }),

  // Remove organization member
  removeMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        memberId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { organizationId, memberId } = input;

      // Users can only remove members from their own organization
      if (organizationId !== userContext.organizationId) {
        throw new Error('Access denied');
      }

      // Check if current user has permission to remove members
      const { data: currentUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userContext.userId)
        .single();

      if (userError || currentUser.role !== 'admin') {
        throw new Error('Insufficient permissions to remove members');
      }

      // Don't allow removing self
      if (memberId === userContext.userId) {
        throw new Error('Cannot remove yourself from the organization');
      }

      const { error } = await supabaseAdmin
        .from('users')
        .update({
          organization_id: null,
          role: 'member',
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .eq('organization_id', organizationId);

      if (error) {
        throw new Error('Failed to remove organization member');
      }

      return { success: true };
    }),

  // Leave organization
  leaveOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      
      // Users can only leave their own organization
      if (input.organizationId !== userContext.organizationId) {
        throw new Error('Access denied');
      }

      const { error } = await supabaseAdmin
        .from('users')
        .update({
          organization_id: null,
          role: 'member',
          updated_at: new Date().toISOString()
        })
        .eq('id', userContext.userId);

      if (error) {
        throw new Error('Failed to leave organization');
      }

      return { success: true };
    }),
});
