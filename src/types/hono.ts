import type { JwtPayload } from '@/utils/jwt';

// Augment Hono's context so `c.get('account')` / `c.set('account', ...)` are
// typed. Populated by the requireAuth middleware after verifying the JWT.
declare module 'hono' {
  interface ContextVariableMap {
    account: JwtPayload;
  }
}
