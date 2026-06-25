---
description: Zod validation schema conventions for request/response validation
globs: "src/schemas/**/*.ts"
alwaysApply: false
---

# Validation Schema Conventions

## Location
- All Zod schemas live in `src/schemas/{domain}.ts`
- Types inferred from schemas live in `src/types/{domain}.ts`

## Patterns
- Reuse `PaginationQuerySchema` as base for list endpoints:
  ```typescript
  const MyQuerySchema = PaginationQuerySchema.extend({ ... });
  ```
- Use `z.coerce.number()` for query params that arrive as strings
- Use `.transform()` for comma-separated values: `z.string().transform(val => val.split(',').map(Number))`
- Use `.regex()` for date format validation: `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)`
- Use `.default()` for optional fields with defaults

## Naming
- Suffix with `Schema`: `RequestCreditCardPayloadSchema`
- Inferred types drop the suffix: `type RequestCreditCardPayload = z.infer<typeof RequestCreditCardPayloadSchema>`

## Validation in Controllers
- Always use `safeParse()` — never `parse()` (which throws)
- Return 400 with `createValidationErrorResponse()` on failure
