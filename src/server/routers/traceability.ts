import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { supabaseAdmin } from '@/src/lib/supabase';
import { transformFromDb } from '@/src/types/server-transforms';
import {
  createErrorResponse,
  createSuccessResponse,
  handleDatabaseError,
  processQueryParams,
  validateRequiredFields,
  sanitizeData,
  addCreateTimestamps,
} from '@/src/lib/supabase-utils';

export const traceabilityRouter = createTRPCRouter({
  // Get incoming requests
  getIncomingRequests: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      
      let query = supabaseAdmin
        .from('trace_requests')
        .select(`
          *,
          requesting_organization:organizations!requesting_organization_id (
            id,
            name,
            email,
            address,
            created_at
          ),
          target_organization:organizations!target_organization_id (
            id,
            name,
            email,
            address,
            created_at
          ),
          assessment:assessments!assessment_id (
            id,
            title,
            description,
            status,
            priority,
            due_date,
            created_at,
            updated_at
          )
        `)
        .eq('target_organization_id', userContext.organizationId);

      const { data: requests, error } = await query;
      
      if (error) {
        throw new Error('Failed to fetch incoming traceability requests');
      }

      return requests?.map((request: any) => ({
        ...(transformFromDb(request) as any),
        requestingOrganization: request.requesting_organization ? transformFromDb(request.requesting_organization) : null,
        targetOrganization: request.target_organization ? transformFromDb(request.target_organization) : null,
        assessment: request.assessment ? transformFromDb(request.assessment) : null
      })) || [];
    }),

  // Get outgoing requests
  getOutgoingRequests: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      
      let query = supabaseAdmin
        .from('trace_requests')
        .select(`
          *,
          requesting_organization:organizations!requesting_organization_id (
            id,
            name,
            email,
            address,
            created_at
          ),
          target_organization:organizations!target_organization_id (
            id,
            name,
            email,
            address,
            created_at
          ),
          assessment:assessments!assessment_id (
            id,
            title,
            description,
            status,
            priority,
            due_date,
            created_at,
            updated_at
          )
        `)
        .eq('requesting_organization_id', userContext.organizationId);

      const { data: requests, error } = await query;

      if (error) {
        throw new Error('Failed to fetch outgoing traceability requests');
      }

      return requests?.map((request: any) => ({
        ...(transformFromDb(request) as any),
        requestingOrganization: request.requesting_organization ? transformFromDb(request.requesting_organization) : null,
        targetOrganization: request.target_organization ? transformFromDb(request.target_organization) : null,
        assessment: request.assessment ? transformFromDb(request.assessment) : null
      })) || [];
    }),

  // Get traceability request by ID
  getTraceabilityRequest: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id } = input;

      // Fetch traceability request details from the database
      const { data: request, error } = await supabaseAdmin
        .from('trace_requests')
        .select(`
          *,
          requesting_organization:organizations!requesting_organization_id(
            id,
            name,
            email,
            address,
            created_at
          ),
          target_organization:organizations!target_organization_id(
            id,
            name,
            email,
            address,
            created_at
          ),
          assessment:assessments!assessment_id(
            id,
            title,
            description,
            status,
            priority,
            due_date,
            product_ids,
            created_at,
            updated_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Traceability request not found');
        }
        throw new Error('Failed to fetch traceability request');
      }

      // Check if user has access to this request
      const hasAccess = 
        request.requesting_organization_id === userContext.organizationId ||
        request.target_organization_id === userContext.organizationId;

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      // Fetch products separately if product_ids exist
      let products = [];
      if (request.product_ids && request.product_ids.length > 0) {
        const { data: productData, error: productError } = await supabaseAdmin
          .from('products')
          .select('*')
          .in('id', request.product_ids);

        if (!productError && productData) {
          products = productData.map((p: any) => transformFromDb(p));
        }
      }

      // Fetch responses for this request
      const { data: responsesData, error: responsesError } = await supabaseAdmin
        .from('assessment_responses')
        .select(`
          *,
          responding_organization:organizations!responding_organization_id(
            id,
            name,
            email
          )
        `)
        .eq('trace_request_id', id);

      const responses = responsesError ? [] : responsesData.map((r: any) => transformFromDb(r));

      // Fetch cascaded requests (child requests)
      const { data: cascadedData, error: cascadedError } = await supabaseAdmin
        .from('trace_requests')
        .select(`
          *,
          requesting_organization:organizations!requesting_organization_id(id, name),
          target_organization:organizations!target_organization_id(id, name)
        `)
        .eq('parent_request_id', id);

      const cascadedRequests = cascadedError ? [] : cascadedData.map((r: any) => transformFromDb(r));

      // Transform the main request and build the response
      return {
        ...transformFromDb(request),
        requestingOrganization: transformFromDb(request.requesting_organization),
        targetOrganization: transformFromDb(request.target_organization),
        assessment: transformFromDb(request.assessment),
        products,
        responses,
        cascadedRequests
      };
    }),

  // Create traceability request
  createTraceabilityRequest: protectedProcedure
    .input(
      z.object({
        targetOrganizationId: z.string(),
        assessmentId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        dueDate: z.string().optional(),
        productIds: z.array(z.string()).optional(),
        cascadeSettings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;

      const newRequest = {
        ...input,
        requestingOrganizationId: userContext.organizationId,
        status: 'pending' as const,
        priority: input.priority || 'medium' as const,
        cascadeSettings: input.cascadeSettings || {},
      };

      // Sanitize and add timestamps
      const requestData = addCreateTimestamps(sanitizeData(newRequest));

      const { data: traceRequest, error } = await supabaseAdmin
        .from('trace_requests')
        .insert(requestData)
        .select(`
          *,
          requesting_organization:organizations!requesting_organization_id (
            id,
            name,
            email,
            address,
            created_at
          ),
          target_organization:organizations!target_organization_id (
            id,
            name,
            email,
            address,
            created_at
          ),
          assessment:assessments!assessment_id (
            id,
            title,
            description,
            status,
            priority,
            due_date,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) {
        throw new Error('Failed to create traceability request');
      }

      // Transform the response data
      return {
        ...(transformFromDb(traceRequest) as any),
        requestingOrganization: traceRequest.requesting_organization ? transformFromDb(traceRequest.requesting_organization) : null,
        targetOrganization: traceRequest.target_organization ? transformFromDb(traceRequest.target_organization) : null,
        assessment: traceRequest.assessment ? transformFromDb(traceRequest.assessment) : null
      };
    }),

  // Update traceability request
  updateTraceabilityRequest: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id, data } = input;

      // First check if the request exists and user has access
      const { data: existingRequest, error: fetchError } = await supabaseAdmin
        .from('trace_requests')
        .select('requesting_organization_id, target_organization_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Traceability request not found');
        }
        throw new Error('Failed to fetch traceability request');
      }

      // Check if user has access to update this request
      const hasAccess = 
        existingRequest.requesting_organization_id === userContext.organizationId ||
        existingRequest.target_organization_id === userContext.organizationId;

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      // Update traceability request in the database
      const { data: updatedData, error } = await supabaseAdmin
        .from('trace_requests')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update traceability request');
      }

      return transformFromDb(updatedData);
    }),

  // Respond to request
  respondToRequest: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        response: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id, response } = input;

      // Implementation for responding to a request
      // This would involve creating assessment responses
      throw new Error('Not implemented yet');
    }),

  // Get analytics
  getAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock data for now - in real implementation, this would aggregate data from database
      return {
        totalRequests: 42,
        pendingRequests: 15,
        completedRequests: 27,
        averageResponseTime: 3.2,
        complianceRate: 85.7,
        requestsByMonth: [
          { month: 'Jan', requests: 8 },
          { month: 'Feb', requests: 12 },
          { month: 'Mar', requests: 15 },
          { month: 'Apr', requests: 7 },
        ],
      };
    }),
});
