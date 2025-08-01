import { initTRPC } from '@trpc/server';
import { getCurrentUserContext } from '@/src/lib/supabase-utils';

// Create context for App Router
export const createTRPCContext = async (opts: { req?: Request }) => {
  try {
    const userContext = await getCurrentUserContext();
    return {
      userContext,
    };
  } catch (error) {
    // If no auth context is available, return null
    return {
      userContext: null,
    };
  }
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userContext) {
    throw new Error('Unauthorized');
  }
  return next({
    ctx: {
      ...ctx,
      userContext: ctx.userContext,
    },
  });
});
