import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { supabaseAdmin } from '@/src/lib/supabase';
import { transformFromDb } from '@/src/types/server-transforms';
import { addCreateTimestamps, sanitizeData } from '@/src/lib/supabase-utils';
import { v4 as uuidv4 } from 'uuid';

export const assessmentRouter = createTRPCRouter({
  // Get assessments
  getAssessments: protectedProcedure
    .query(async ({ ctx }) => {
      const userContext = ctx.userContext!;

      const { data: assessments, error } = await supabaseAdmin
        .from('assessments')
        .select('*')
        .eq('organization_id', userContext.organizationId);

      if (error) {
        throw new Error('Failed to fetch assessments');
      }

      return assessments?.map((assessment: any) => transformFromDb(assessment)) || [];
    }),

  // Get assessment by ID
  getAssessmentById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id } = input;

      const { data: assessment, error } = await supabaseAdmin
        .from('assessments')
        .select('*')
        .eq('id', id)
        .eq('organization_id', userContext.organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Assessment not found');
        }
        throw new Error('Failed to fetch assessment');
      }

      return transformFromDb(assessment);
    }),

  // Create assessment
  createAssessment: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        dueDate: z.string().optional(),
        questions: z.array(z.record(z.any())).optional(),
        productIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;

      const assessmentData = {
        ...input,
        id: uuidv4(),
        organizationId: userContext.organizationId,
        status: 'draft' as const,
        priority: input.priority || 'medium' as const,
      };

      const sanitizedData = addCreateTimestamps(sanitizeData(assessmentData));

      const { data: assessment, error } = await supabaseAdmin
        .from('assessments')
        .insert(sanitizedData)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create assessment');
      }

      return transformFromDb(assessment);
    }),

  // Update assessment
  updateAssessment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id, data } = input;

      const { data: updatedAssessment, error } = await supabaseAdmin
        .from('assessments')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', userContext.organizationId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Assessment not found');
        }
        throw new Error('Failed to update assessment');
      }

      return transformFromDb(updatedAssessment);
    }),

  // Delete assessment
  deleteAssessment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id } = input;

      const { error } = await supabaseAdmin
        .from('assessments')
        .delete()
        .eq('id', id)
        .eq('organization_id', userContext.organizationId);

      if (error) {
        throw new Error('Failed to delete assessment');
      }

      return { success: true };
    }),

  // Search assessments
  searchAssessments: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;

      let query = supabaseAdmin
        .from('assessments')
        .select('*')
        .eq('organization_id', userContext.organizationId);

      if (input?.query) {
        query = query.or(`title.ilike.%${input.query}%,description.ilike.%${input.query}%`);
      }

      if (input?.status) {
        query = query.eq('status', input.status);
      }

      if (input?.priority) {
        query = query.eq('priority', input.priority);
      }

      const { data: assessments, error } = await query;

      if (error) {
        throw new Error('Failed to search assessments');
      }

      return assessments?.map((assessment: any) => transformFromDb(assessment)) || [];
    }),

  // Get assessment templates
  getTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      const { data: templates, error } = await supabaseAdmin
        .from('assessment_templates')
        .select('*')
        .eq('is_public', true);

      if (error) {
        throw new Error('Failed to fetch assessment templates');
      }

      return templates?.map((template: any) => transformFromDb(template)) || [];
    }),

  // Get template by ID
  getTemplateById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const { data: template, error } = await supabaseAdmin
        .from('assessment_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Assessment template not found');
        }
        throw new Error('Failed to fetch assessment template');
      }

      return transformFromDb(template);
    }),

  // Create assessment template
  createTemplate: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        questions: z.array(z.record(z.any())),
        category: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;

      const templateData = {
        ...input,
        id: uuidv4(),
        creatorId: userContext.userId,
        organizationId: userContext.organizationId,
        isPublic: input.isPublic || false,
      };

      const sanitizedData = addCreateTimestamps(sanitizeData(templateData));

      const { data: template, error } = await supabaseAdmin
        .from('assessment_templates')
        .insert(sanitizedData)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create assessment template');
      }

      return transformFromDb(template);
    }),
});
