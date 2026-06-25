---
description: Environment variable and configuration conventions
globs: "src/utils/env.ts,src/config/**/*.ts"
alwaysApply: false
---

# Environment & Configuration Rules

## Adding Environment Variables
1. Add the Zod schema in `src/utils/env.ts` under the `server` key
2. Use `z.string().min(1)` for required strings, `z.coerce.number()` for numbers
3. Import via `import { env } from '@/utils/env'` — never access `Bun.env` or `process.env` directly
4. All vars are validated at startup — the app won't start with missing/invalid vars

## External Service Configs (`src/config/`)
- One file per external service (AWS S3, Redis, SendGrid, etc.)
- Singleton pattern for connections: initialize once, export the client
- Test connections in `src/server.ts` before starting the HTTP server

## Sensitive Data
- Never commit `.env`, `.env.*.local`, or credentials
- Use `env.SOME_VAR` — never hardcode secrets
