import type { Context, Next } from 'hono';
import { verifyToken } from '@/utils/jwt';
import '@/types/hono';

// Gate routes behind a valid Bearer JWT. On success the decoded payload is
// stashed on the context as `account` for downstream handlers.
export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header('Authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return c.json(
      {
        error: {
          message: 'Missing or invalid Authorization header',
          statusCode: 401,
        },
      },
      401
    );
  }

  try {
    const payload = await verifyToken(token);
    c.set('account', payload);
    await next();
  } catch {
    return c.json(
      { error: { message: 'Invalid or expired token', statusCode: 401 } },
      401
    );
  }
}
