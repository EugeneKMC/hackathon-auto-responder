---
description: Scaffold a new API endpoint with all required layers
---

Create a new API endpoint: $ARGUMENTS

Follow the project's layered architecture. For each layer, match the existing patterns:

1. **Schema** (`src/schemas/`): Zod validation schema for request payload/query params
2. **Type** (`src/types/`): Infer TypeScript type from the Zod schema
3. **Repository** (`src/repositories/`): Drizzle ORM query method
4. **Service** (`src/services/`): Business logic returning `ServiceResponse`
5. **Controller** (`src/controllers/`): Request handler with `safeParse()` validation
6. **Route** (`src/routes/`): Register the endpoint on the appropriate consumer (hub/erp)
7. **Mount** (`src/app.ts`): Ensure route group is mounted if new

Naming conventions:
- Files: snake_case matching the domain
- Routes: RESTful paths under `/api/hub/` or `/api/erp/`
- Add to existing domain files when possible — don't create new files for a single endpoint
