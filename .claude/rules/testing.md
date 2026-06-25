---
description: Testing conventions for Bun test runner
globs: "**/*.test.ts,**/*.spec.ts"
alwaysApply: false
---

# Testing Conventions

## Test Runner
- Uses Bun's built-in test runner: `bun run test`
- Test files: `*.test.ts` or `*.spec.ts`, co-located next to source files

## Structure
```typescript
import { describe, it, expect } from 'bun:test';

describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do expected behavior', () => {
      // Arrange, Act, Assert
    });
  });
});
```

## Guidelines
- Test service logic — not controllers or repositories in isolation
- Mock external services (SendGrid, AWS, RBAC API) — not the database
- Use `ServiceResponse` assertions: check both `result` and `error`
- Test approval workflow state transitions explicitly
- Name tests descriptively: `'should return badRequest when card request already approved'`
