---
applyTo: **/*.ts
---
# Naming conventions
1. Use camelCase for variables and functions.
2. Use PascalCase for types and interfaces.
3. Use kebab-case for file names.
4. Use singular nouns for types and interfaces, e.g., `User`, `Product`.
5. Use plural nouns for collections, e.g., `Users`, `Products`.

# For database schema
1. Use snake_case for database table and column names. Check `docs/schema.sql` for the schema.
2. Map database types to TypeScript types in the `src/types/database.ts` and export a mapping function to convert database records to TypeScript objects and use it in api routes.
3. Id fields should be named `id` in both database and TypeScript and should be type uuid v5 string.
