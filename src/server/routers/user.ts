import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { supabaseAdmin } from '@/src/lib/supabase';
import { transformFromDb } from '@/src/types/server-transforms';
import { addCreateTimestamps, sanitizeData } from '@/src/lib/supabase-utils';

export const userRouter = createTRPCRouter({
  // Get current user
  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      const userContext = ctx.userContext!;

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          organization:organizations!organization_id(*)
        `)
        .eq('id', userContext.userId)
        .single();

      if (error) {
        throw new Error('Failed to fetch current user');
      }

      return {
        ...transformFromDb(user),
        organization: user.organization ? transformFromDb(user.organization) : null,
      };
    }),

  // Get users in organization
  getUsersInOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const organizationId = input.organizationId || userContext.organizationId;

      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) {
        throw new Error('Failed to fetch users');
      }

      return users?.map((user: any) => transformFromDb(user)) || [];
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        avatar: z.string().optional(),
        bio: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', userContext.userId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update user profile');
      }

      return transformFromDb(user);
    }),

  // Update user role
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['admin', 'manager', 'member']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { userId, role } = input;

      // Check if current user has permission to update roles
      const { data: currentUser, error: currentUserError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userContext.userId)
        .single();

      if (currentUserError || currentUser.role !== 'admin') {
        throw new Error('Insufficient permissions to update user roles');
      }

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .update({
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('organization_id', userContext.organizationId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update user role');
      }

      return transformFromDb(user);
    }),

  // Deactivate user
  deactivateUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { userId } = input;

      // Check if current user has permission
      const { data: currentUser, error: currentUserError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userContext.userId)
        .single();

      if (currentUserError || currentUser.role !== 'admin') {
        throw new Error('Insufficient permissions to deactivate users');
      }

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('organization_id', userContext.organizationId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to deactivate user');
      }

      return transformFromDb(user);
    }),

  // Activate user
  activateUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { userId } = input;

      // Check if current user has permission
      const { data: currentUser, error: currentUserError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userContext.userId)
        .single();

      if (currentUserError || currentUser.role !== 'admin') {
        throw new Error('Insufficient permissions to activate users');
      }

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('organization_id', userContext.organizationId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to activate user');
      }

      return transformFromDb(user);
    }),
});
