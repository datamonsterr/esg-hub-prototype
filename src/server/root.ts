import { createTRPCRouter } from './trpc';
import { assessmentRouter } from './routers/assessment';
import { integrationRouter } from './routers/integration';
import { organizationRouter } from './routers/organization';
import { productRouter } from './routers/product';
import { traceabilityRouter } from './routers/traceability';
import { userRouter } from './routers/user';
import { documentRouter } from './routers/document';
import { onboardingRouter } from './routers/onboarding';
import { managementRouter } from './routers/management';
import { notificationRouter } from './routers/notification';

/**
 * This is the primary router for your server.
 *
 * All routers added in /server/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  assessment: assessmentRouter,
  integration: integrationRouter,
  organization: organizationRouter,
  product: productRouter,
  traceability: traceabilityRouter,
  user: userRouter,
  document: documentRouter,
  onboarding: onboardingRouter,
  management: managementRouter,
  notification: notificationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
