---
description: Add or modify a database table/column with proper migration
---

Make the following database change: $ARGUMENTS

Steps:
1. Modify the Drizzle schema in `src/models/`
2. Run `bun run db:generate` to create the migration
3. Run `bun run db:check` to validate migration consistency
4. If adding a lookup table, create seed data in `src/config/database/seeds/`
5. Update the repository layer if new queries are needed
6. Update types in `src/types/` if the shape changed

Rules:
- Include `createdAt` and `updatedAt` on new tables
- Use `serial('id')` for auto-incrementing PKs
- Never manually edit files in `src/config/database/migrations/`
- Add new env vars to `src/utils/env.ts` if the change requires configuration
