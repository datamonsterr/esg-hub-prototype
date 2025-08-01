import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ProcessedDocument } from '../../types/integration';
import { supabaseAdmin } from '../../lib/supabase';

export const documentRouter = createTRPCRouter({
  getProcessedDocument: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }): Promise<ProcessedDocument> => {
      const { data, error } = await supabaseAdmin
        .from('file_uploads')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch document: ${error.message}`);
      }

      // Transform database row to ProcessedDocument type
      // Note: This is a mock transformation - adjust based on actual database schema
      return {
        id: data.id.toString(),
        fileName: data.original_filename || data.filename || 'Unknown',
        description: data.description || 'No description',
        actors: [], // Mock data - adjust based on your needs
        available_actions: [], // Mock data - adjust based on your needs
        sections: [], // Mock data - adjust based on your needs
      };
    }),
});
