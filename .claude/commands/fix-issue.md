---
description: Investigate and fix a GitHub issue by number
---

Investigate and fix the following GitHub issue: $ARGUMENTS

Steps:
1. Fetch the issue details using `gh issue view $ARGUMENTS`
2. Understand the bug/feature request
3. Search the codebase for relevant files following the layer pattern: routes -> controllers -> services -> repositories -> models
4. Implement the fix following project conventions:
   - ServiceResponse pattern for services
   - Zod validation for new inputs
   - Proper error handling in controllers
5. Run `bun run lint:fix` to ensure code style compliance
6. Summarize what was changed and why
