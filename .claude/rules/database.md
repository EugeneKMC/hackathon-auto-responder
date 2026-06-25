---
description: Database schema and migration conventions using Drizzle ORM
globs: "src/models/**/*.ts,src/config/database/**/*.ts"
alwaysApply: false
---

# Database Conventions

## Schema Definitions (`src/models/`)
- Define tables using Drizzle's `pgTable()` with typed columns
- Include `createdAt` and `updatedAt` timestamps on all tables
- Use `serial('id')` for auto-incrementing primary keys
- Define relations in the same file as the table
- Export table references for use in repositories

## Migrations
- Generate with `bun run db:generate` after schema changes
- Apply with `bun run db:migrate`
- Never manually edit migration files in `src/config/database/migrations/`
- Validate with `bun run db:check` before deploying

## Seeding (`src/config/database/seeds/`)
- Seed lookup/reference tables only (statuses, banks, levels)
- Run with `bun run db:seed`

## Environment Variables
- All DB connection vars validated in `src/utils/env.ts`
- Add new vars with Zod schema before using them
