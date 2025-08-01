import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { supabaseAdmin } from '@/src/lib/supabase';
import { transformFromDb } from '@/src/types/server-transforms';
import { addCreateTimestamps, sanitizeData } from '@/src/lib/supabase-utils';
import { v4 as uuidv4 } from 'uuid';

export const integrationRouter = createTRPCRouter({
  // Get file upload data
  getFileUpload: protectedProcedure
    .query(async ({ ctx }) => {
      const userContext = ctx.userContext!;

      const { data: uploads, error } = await supabaseAdmin
        .from('file_uploads')
        .select('*')
        .eq('organization_id', userContext.organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch file uploads');
      }

      return uploads?.map((upload: any) => transformFromDb(upload)) || [];
    }),

  // Get activity by ID
  getActivityById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id } = input;

      const { data: activity, error } = await supabaseAdmin
        .from('integration_activities')
        .select(`
          *,
          product:products!product_id(*)
        `)
        .eq('id', id)
        .eq('organization_id', userContext.organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Integration activity not found');
        }
        throw new Error('Failed to fetch integration activity');
      }

      return {
        ...transformFromDb(activity),
        product: activity.product ? transformFromDb(activity.product) : null,
      };
    }),

  // Get document by ID
  getDocumentById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      // Mock document structure for now
      const mockDocument = {
        id,
        fileName: 'Sample Document',
        description: `Processed document: ${id}`,
        sections: [
          {
            title: "File Preview",
            type: "file-preview",
            contentUrl: `/api/documents/validation/${id}/file-preview`
          },
          {
            title: "Document Summary", 
            type: "document-summary",
            contentUrl: `/api/documents/validation/${id}/summary`
          }
        ]
      };

      return mockDocument;
    }),

  // Get file preview
  getFilePreview: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { documentId } = input;

      // Mock file preview data
      const mockPreview = {
        id: documentId,
        fileName: 'sample-document.csv',
        fileSize: '2.5 MB',
        data: [
          {
            material: "Organic Cotton",
            origin: "India - Gujarat",
            supplier: "GreenTech Materials Ltd",
            cert: "GOTS Certified",
            date: new Date().toISOString().split('T')[0],
            qty: 2500,
            unit: "kg",
            status: "verified"
          },
          {
            material: "Recycled Polyester",
            origin: "Japan - Osaka",
            supplier: "EcoFiber Corp",
            cert: "GRS Certified",
            date: new Date().toISOString().split('T')[0],
            qty: 1800,
            unit: "kg",
            status: "verified"
          }
        ]
      };

      return mockPreview;
    }),

  // Get document summary
  getDocumentSummary: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { documentId } = input;

      // Mock document summary data
      const mockSummary = {
        id: documentId,
        description: `ESG compliance report covering supply chain traceability, material origins, and certification status.`,
        reportingPeriod: "2024 Q1",
        organizationCount: 3,
        keyMetrics: [
          {
            name: "Material Traceability",
            value: "85",
            unit: "%",
            category: "compliance"
          },
          {
            name: "Supplier Certifications",
            value: "3",
            unit: "active",
            category: "certification"
          },
          {
            name: "Carbon Footprint",
            value: "2.4",
            unit: "tCO2e",
            category: "environmental"
          }
        ],
        dataQuality: {
          completeness: 75,
          accuracy: 82,
          consistency: 78
        }
      };

      return mockSummary;
    }),

  // Create document
  createDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        fileName: z.string(),
        fileExtension: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, fileName, fileExtension } = input;

      // Create processed document entry with basic mock data
      const newProcessedDoc = {
        id,
        fileName,
        description: `Processed document: ${fileName}`,
        sections: [
          {
            title: "File Preview",
            type: "file-preview",
            contentUrl: `/api/documents/validation/${id}/file-preview`
          },
          {
            title: "Document Summary",
            type: "document-summary", 
            contentUrl: `/api/documents/validation/${id}/summary`
          }
        ]
      };

      // In a real implementation, this would save to a documents table
      return newProcessedDoc;
    }),

  // Get CSV import data
  getCsvImport: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock CSV import data
      return {
        availableTemplates: [
          { id: 'bom', name: 'Bill of Materials', description: 'Import product hierarchy and components' },
          { id: 'suppliers', name: 'Supplier List', description: 'Import supplier information and relationships' },
          { id: 'materials', name: 'Material Database', description: 'Import raw materials and specifications' },
        ],
        recentImports: [
          { id: '1', fileName: 'Q1_BOM_Import.csv', status: 'completed', date: '2024-01-15' },
          { id: '2', fileName: 'Supplier_Data.csv', status: 'processing', date: '2024-01-14' },
        ]
      };
    }),

  // Upload file
  uploadFile: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        fileType: z.string(),
        productId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;

      const uploadData = {
        ...input,
        id: uuidv4(),
        organizationId: userContext.organizationId,
        status: 'uploaded' as const,
        uploadedBy: userContext.userId,
      };

      const sanitizedData = addCreateTimestamps(sanitizeData(uploadData));

      const { data: upload, error } = await supabaseAdmin
        .from('file_uploads')
        .insert(sanitizedData)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create file upload record');
      }

      return transformFromDb(upload);
    }),

  // Create integration activity
  createActivity: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        fileName: z.string(),
        productId: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;

      const activityData = {
        ...input,
        id: uuidv4(),
        organizationId: userContext.organizationId,
        status: 'processing' as const,
        initiatedBy: userContext.userId,
      };

      const sanitizedData = addCreateTimestamps(sanitizeData(activityData));

      const { data: activity, error } = await supabaseAdmin
        .from('integration_activities')
        .insert(sanitizedData)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create integration activity');
      }

      return transformFromDb(activity);
    }),

  // Update activity status
  updateActivityStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['processing', 'success', 'failed']),
        result: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id, status, result } = input;

      const { data: activity, error } = await supabaseAdmin
        .from('integration_activities')
        .update({
          status,
          result,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', userContext.organizationId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update integration activity');
      }

      return transformFromDb(activity);
    }),
});
