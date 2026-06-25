---
description: Review current changes for bugs, security issues, and convention violations
---

Review the following diff for bugs, security issues, and violations of this project's conventions:

$!git diff HEAD

Check for:
1. **Security**: SQL injection, exposed secrets, missing auth checks, OWASP top 10
2. **ServiceResponse**: All service methods must return `ServiceResponse.*()` — never throw
3. **Validation**: Controllers must use `safeParse()` with proper error responses
4. **Layer violations**: No business logic in controllers/repositories, no HTTP concerns in services
5. **Environment**: No raw `Bun.env` or `process.env` — use `env` from `@/utils/env`
6. **Error handling**: Controllers catch errors with `createErrorResponse()`, validation with `createValidationErrorResponse()`
7. **Import paths**: Use `@/*` alias — no relative paths climbing out of the domain

Provide a summary of findings with file:line references and suggested fixes.
