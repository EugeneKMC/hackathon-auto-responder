---
description: Run lint check and auto-fix issues
---

$!bun run lint 2>&1

Review lint output above. If there are errors:
1. Fix all auto-fixable issues by running `bun run lint:fix`
2. For remaining errors, apply manual fixes following project conventions
3. Re-run lint to verify all issues are resolved
