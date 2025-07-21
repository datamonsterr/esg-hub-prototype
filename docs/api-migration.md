# API Migration from json-server to Next.js 15 API Routes

This document outlines the migration from json-server to Next.js 15 API routes for the ESG Hub prototype.

## Migration Overview

We've successfully migrated from using json-server (running on port 3001) to Next.js 15 API routes. This provides better integration with the frontend, improved performance, and eliminates the need for a separate backend server.

## New API Structure

### Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.vercel.app/api`

### Endpoints

#### Organizations

- `GET /api/organizations` - List all organizations with filtering
- `POST /api/organizations` - Create new organization
- `GET /api/organizations/[id]` - Get specific organization
- `PUT /api/organizations/[id]` - Update organization
- `DELETE /api/organizations/[id]` - Delete organization

#### Products

- `GET /api/products` - List all products with filtering
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get specific product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

#### Components

- `GET /api/components` - List all components with filtering
- `POST /api/components` - Create new component
- `GET /api/components/[id]` - Get specific component
- `PUT /api/components/[id]` - Update component
- `DELETE /api/components/[id]` - Delete component

#### Traceability Requests

- `GET /api/traceability-requests-incoming` - List incoming requests
- `POST /api/traceability-requests-incoming` - Create incoming request
- `GET /api/traceability-requests-outgoing` - List outgoing requests
- `POST /api/traceability-requests-outgoing` - Create outgoing request

#### Generic Collections

- `GET /api/[collection]` - Access any collection from db.json
- `POST /api/[collection]` - Add to any collection
- `PUT /api/[collection]` - Update collection (for object collections)
- `GET /api/[collection]/[id]` - Get specific item from collection
- `PUT /api/[collection]/[id]` - Update specific item
- `DELETE /api/[collection]/[id]` - Delete specific item

## Query Parameters

The API supports json-server compatible query parameters:

### Filtering

```
GET /api/organizations?type=supplier
GET /api/products?category=footwear&organizationId=org-001
```

### Sorting

```
GET /api/organizations?_sort=name&_order=asc
GET /api/products?_sort=createdAt&_order=desc
```

### Pagination

```
GET /api/organizations?_page=1&_limit=10
```

### Full-text Search

```
GET /api/organizations?name=eco
```

## Features

### Automatic ID Generation

- Automatically generates IDs for new items if not provided
- Format: `{prefix}-{timestamp}` (e.g., `org-1a2b3c4d`)

### Timestamps

- Automatically adds `createdAt` and `updatedAt` timestamps
- Updates `updatedAt` on every modification

### Error Handling

- Consistent error responses with appropriate HTTP status codes
- Detailed error logging for debugging

### Data Validation

- Preserves original data structure
- Prevents ID modification during updates
- Maintains data integrity

## Migration Changes

### Removed Dependencies

- `json-server` package removed from `package.json`
- `server` script removed from npm scripts

### Updated Configuration

- `src/api/axios.ts` baseURL changed from `http://localhost:3001` to `/api`
- All existing API calls will continue to work without changes

### New Files Added

```
src/
├── app/
│   └── api/
│       ├── [collection]/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── organizations/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── products/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── components/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── traceability-requests-incoming/
│       │   └── route.ts
│       └── traceability-requests-outgoing/
│           └── route.ts
└── lib/
    └── api-utils.ts
```

## Benefits of Migration

1. **Single Server**: No need to run separate json-server
2. **Better Integration**: Direct access to Next.js features
3. **Production Ready**: Works seamlessly on Vercel
4. **Type Safety**: Full TypeScript support
5. **Performance**: Server-side optimizations
6. **Scalability**: Can easily extend with business logic
7. **Security**: Better control over data access

## Development Workflow

### Before Migration

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run server
```

### After Migration

```bash
# Single terminal
npm run dev
```

## Testing the Migration

You can test the API endpoints using:

```bash
# Get all organizations
curl http://localhost:3000/api/organizations

# Get specific organization
curl http://localhost:3000/api/organizations/org-001

# Create new organization
curl -X POST http://localhost:3000/api/organizations \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test Org","type":"supplier"}'
```

## Compatibility

The new API routes are fully compatible with existing frontend code. All SWR hooks and axios calls will continue to work without any modifications.

## Future Enhancements

With this foundation, you can easily add:

- Authentication middleware
- Rate limiting
- Data validation with Zod
- Real database integration
- Caching strategies
- API versioning
- GraphQL endpoints
