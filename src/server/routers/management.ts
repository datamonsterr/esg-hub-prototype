import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { IntegrationActivity, IntegrationActivityClient } from '../../types/integration';
import { supabaseAdmin } from '../../lib/supabase';

// Helper function to convert snake_case to camelCase
const toCamelCase = (activity: IntegrationActivity): IntegrationActivityClient => ({
  id: activity.id,
  organizationId: activity.organization_id,
  title: activity.title,
  subtitle: activity.subtitle,
  status: activity.status,
  createdAt: activity.created_at,
});

// Helper function to convert camelCase to snake_case
const toSnakeCase = (activity: Partial<IntegrationActivityClient>): Partial<IntegrationActivity> => ({
  ...(activity.id !== undefined && { id: activity.id }),
  ...(activity.organizationId !== undefined && { organization_id: activity.organizationId }),
  ...(activity.title !== undefined && { title: activity.title }),
  ...(activity.subtitle !== undefined && { subtitle: activity.subtitle }),
  ...(activity.status !== undefined && { status: activity.status }),
  ...(activity.createdAt !== undefined && { created_at: activity.createdAt }),
});

export const managementRouter = createTRPCRouter({
  getActivities: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input, ctx }): Promise<IntegrationActivityClient[]> => {
      let query = supabaseAdmin
        .from('integration_activities')
        .select('*')
        .eq('organization_id', ctx.userContext.organizationId)
        .order('created_at', { ascending: false });

      if (input.limit) {
        query = query.limit(input.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch activities: ${error.message}`);
      }

      return (data || []).map((activity: IntegrationActivity) => toCamelCase(activity));
    }),

  getActivity: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }): Promise<IntegrationActivityClient> => {
      const { data, error } = await supabaseAdmin
        .from('integration_activities')
        .select('*')
        .eq('id', input.id)
        .eq('organization_id', ctx.userContext.organizationId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch activity: ${error.message}`);
      }

      return toCamelCase(data);
    }),

  createActivity: protectedProcedure
    .input(z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }): Promise<IntegrationActivityClient> => {
      const newActivity = {
        organization_id: ctx.userContext.organizationId,
        title: input.title,
        subtitle: input.subtitle || null,
        status: input.status || 'processing',
      };

      const { data, error } = await supabaseAdmin
        .from('integration_activities')
        .insert(newActivity)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to create activity: ${error.message}`);
      }

      return toCamelCase(data);
    }),

  updateActivity: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }): Promise<IntegrationActivityClient> => {
      const { id, ...updateData } = input;
      
      const { data, error } = await supabaseAdmin
        .from('integration_activities')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', ctx.userContext.organizationId)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to update activity: ${error.message}`);
      }

      return toCamelCase(data);
    }),

  deleteActivity: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }): Promise<IntegrationActivityClient> => {
      const { data, error } = await supabaseAdmin
        .from('integration_activities')
        .delete()
        .eq('id', input.id)
        .eq('organization_id', ctx.userContext.organizationId)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to delete activity: ${error.message}`);
      }

      return toCamelCase(data);
    }),
});
