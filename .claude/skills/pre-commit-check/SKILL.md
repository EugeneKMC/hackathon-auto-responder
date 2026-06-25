---
description: Validate code quality before committing changes
trigger: before_commit
---

# Pre-Commit Check Skill

Before committing, ensure code quality standards are met.

## Checks
1. **Lint**: Run `bun run lint` — all errors must be resolved
2. **Layer conventions**: Verify changed files follow the Route -> Controller -> Service -> Repository pattern
3. **ServiceResponse**: Any new/modified service methods must return `ServiceResponse.*()`
4. **Validation**: New controller endpoints must use Zod `safeParse()` for input validation
5. **Environment**: No raw `Bun.env` or `process.env` usage — must use `env` from `@/utils/env`
6. **Secrets**: No hardcoded API keys, tokens, or credentials in committed code

## On Failure
- Report specific violations with file:line references
- Suggest fixes for each violation
- Do not proceed with the commit until resolved
