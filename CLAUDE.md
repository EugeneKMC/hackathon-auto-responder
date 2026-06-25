# CLAUDE.md

Guidance for Claude Code when working with this repo.

## Project Overview

Hackathon auto-email-responder — polls Microsoft Graph for inbound support emails, uses an OpenAI agent to extract intent and entities, looks up the relevant data, and sends an automated reply. Built with **Bun + Hono.js + TypeScript + PostgreSQL (Drizzle ORM)**.

## Common Commands

```bash
bun install
bun run dev                # Dev server with hot reload
bun run db:generate        # Generate migration from schema changes
bun run db:migrate         # Apply pending migrations
bun run db:check           # Validate migration consistency
bun run lint               # ESLint check
bun run lint:fix           # Auto-fix lint issues
bun run test               # Run Bun test suite
```

## Architecture

### Inbound Flow

```
MS Graph mailbox → Email poller (job) → Inbound service → Agent (LLM)
   → Domain service (DB lookup) → Reply via Graph sendMail
```

### Layer Responsibilities

| Layer | Location | Role |
|-------|----------|------|
| Routes | `src/routes/` | Hono route definitions |
| Middleware | `src/middlewares/` | Auth, request validation, webhook key checks |
| Controllers | `src/controllers/` | Parse requests, call services, return HTTP responses |
| Services | `src/services/` | Business logic — DB writes, replies, agent orchestration |
| Agents | `src/agents/` | LLM agents — intent extraction, response drafting, tool definitions |
| Repositories | `src/repositories/` | Drizzle ORM queries only |
| Models | `src/models/` | Drizzle table schema definitions |
| Schemas | `src/schemas/` | Zod validation schemas for request/response |
| Jobs | `src/jobs/` | Background workers (email poller, retry handler) |
| Constants | `src/constants/` | Enums for intents, statuses, etc. |
| Types | `src/types/` | TypeScript type definitions |
| Config | `src/config/` | External service clients (Graph, OpenAI, DB) |
| Utils | `src/utils/` | env validation, ServiceResponse |

### Key Patterns

- **ServiceResponse** (`src/utils/service_response.ts`): All service methods return `{ result, error }` via `ServiceResponse.success()`, `.badRequest()`, `.unauthorized()`, `.notFound()`, `.internalServerError()`. Services never throw.
- **Environment validation**: `src/utils/env.ts` uses `@t3-oss/env-core` + Zod. All env vars validated at startup. Add new vars there with a Zod schema.
- **Path alias**: `@/*` maps to `./src/*` (configured in tsconfig.json).
- **Agents vs Services**: Agents wrap LLM calls and tool/function definitions; services orchestrate the agent's structured output with DB writes and external API calls.

### External Services

| Service | Config Location | Purpose |
|---------|----------------|---------|
| PostgreSQL | `src/config/database/db.ts` | Primary database |
| OpenAI | `src/config/openai.ts` | LLM for intent extraction + reply drafting |
| Microsoft Graph | `src/config/msgraph.ts` | Read inbound mail, send replies |

## Code Style

- Prettier: single quotes, semicolons, 2-space indent, 80 char width, ES5 trailing commas
- ESLint: unused vars error (underscore-prefixed ignored), no `any`
- snake_case for file names
- PascalCase for types/interfaces, camelCase for variables/functions
- `@/*` path alias for all internal imports
- Unused variable prefix: `_`

## Request Flow (never skip layers)

```
Route -> Middleware -> Controller -> Service -> Repository -> DB
                                         |
                                         +-> Agent (LLM) -> external APIs
```
