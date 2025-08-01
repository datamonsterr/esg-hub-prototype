---
description: when write new api fetch
applyTo: src/api/*.ts
---
Use tRPC for api calls in the application.

# tRPC Setup
- All API routes are defined in `src/server/routers/`
- Client-side hooks are defined in `src/api/`
- Use the `api` client from `src/utils/api.ts`

# Naming convention:
- Server procedures: `getSomething`, `createSomething`, `updateSomething`, `deleteSomething`
- Client hooks: `useGetSomething`, `useCreateSomething`, `useUpdateSomething`, `useDeleteSomething`

# Example patterns:

## Server router (src/server/routers/example.ts):
```typescript
export const exampleRouter = createTRPCRouter({
  getItems: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      // Implementation
    }),
    
  createItem: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
});
```

## Client hooks (src/api/example.ts):
```typescript
export function useGetItems(limit?: number) {
  return api.example.getItems.useQuery({ limit });
}

export function useCreateItem() {
  return api.example.createItem.useMutation();
}
```

# Important notes:
- Never import from `axios` or `swr` - use tRPC only
- All procedures should use proper Zod validation
- Use `protectedProcedure` for authenticated endpoints
- Return consistent error messages

