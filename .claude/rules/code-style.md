---
description: Code style and formatting conventions for all TypeScript files
globs: "src/**/*.ts"
alwaysApply: true
---

# Code Style Rules

## Formatting (enforced by Prettier)
- Single quotes, semicolons, 2-space indent, 80 char width, ES5 trailing commas
- Run `bun run lint:fix` before committing

## TypeScript Conventions
- Use `@/*` path alias for all imports from `src/` (e.g., `import { env } from '@/utils/env'`)
- Prefix unused variables with `_` (e.g., `_unused`)
- Infer types from Zod schemas: `type Foo = z.infer<typeof FooSchema>`
- Use `as const` for constant objects and enums
- Never use `any` — use `unknown` and narrow with type guards

## File Organization
- One domain per file across layers (e.g., `credit_card.ts` in controllers/, services/, repositories/, models/, schemas/, types/, constants/)
- snake_case for file names
- PascalCase for types/interfaces, camelCase for variables/functions

## Import Order
1. External packages
2. `@/` aliased internal imports
3. Relative imports

## Error Handling
- Controllers: catch with `createErrorResponse(error)`, validation with `createValidationErrorResponse(error)`
- Services: return `ServiceResponse.*()` — never throw
- Repositories: pure data access only — let errors propagate to service layer
