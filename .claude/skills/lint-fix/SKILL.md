---
description: Auto-fix lint and formatting issues after code changes
trigger: after_edit
match: "src/**/*.ts"
---

# Lint Fix Skill

After editing TypeScript files in `src/`, run the linter to catch issues early.

## Steps
1. Run `bun run lint` to check for issues
2. If errors found, run `bun run lint:fix` to auto-fix
3. Report any remaining issues that need manual attention

## Rules
- Only run after substantial code changes (new files, new functions)
- Don't block the user — report findings concisely
- Focus on: unused vars, missing semicolons, quote style, import order
