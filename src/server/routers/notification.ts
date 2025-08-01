import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { Notification } from '../../types/notification';
import { supabaseAdmin } from '../../lib/supabase';

export const notificationRouter = createTRPCRouter({
  getNotifications: protectedProcedure
    .query(async ({ ctx }): Promise<Notification[]> => {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', ctx.userContext.userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch notifications: ${error.message}`);
      }

      return data || [];
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', input.id)
        .eq('user_id', ctx.userContext.userId);

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }

      return { success: true };
    }),

  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', ctx.userContext.userId)
        .eq('is_read', false);

      if (error) {
        throw new Error(`Failed to mark all notifications as read: ${error.message}`);
      }

      return { success: true };
    }),
});
