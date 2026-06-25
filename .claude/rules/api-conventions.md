---
description: API layer conventions for routes, controllers, services, and repositories
globs: "src/{routes,controllers,services,repositories}/**/*.ts"
alwaysApply: true
---

# API Layer Conventions

## Request Flow (never skip layers)
```
Route -> Middleware -> Controller -> Service -> Repository -> DB
```

## Routes (`src/routes/`)
- File naming: `{domain}_{consumer}.ts` (e.g., `credit_card_hub.ts`, `liquidation_erp.ts`)
- Apply middleware with `.use('*', middleware)` at route group level
- Mount under `/api/hub/*` (employee) or `/api/erp/*` (finance/admin)
- Keep route files thin — just method, path, and controller reference

## Controllers (`src/controllers/`)
- Parse and validate request input using Zod schemas with `safeParse()`
- Call a single service method — no business logic here
- Return HTTP response with appropriate status code
- Access auth context via `c.get('user')`, `c.get('clerkId')`, etc.
- Pattern:
  ```typescript
  const validated = SomeSchema.safeParse(data);
  if (!validated.success) return c.json({ error: createValidationErrorResponse(validated.error) }, 400);
  const { result, error } = await someService.doThing(validated.data);
  if (error) return c.json({ error }, error.statusCode);
  return c.json(result);
  ```

## Services (`src/services/`)
- All methods return `ServiceResponse` — never throw exceptions
- Use `ServiceResponse.success()`, `.badRequest()`, `.unauthorized()`, `.notFound()`, `.internalServerError()`
- Orchestrate business logic: call repositories, external APIs, queues
- Handle approval workflows, email notifications, file processing here

## Repositories (`src/repositories/`)
- Pure Drizzle ORM queries only — no business logic
- Use typed query builders: `eq()`, `and()`, `or()`, `inArray()`, `desc()`
- Use `withPagination()` helper for paginated queries
- Return typed results — never raw SQL unless necessary
