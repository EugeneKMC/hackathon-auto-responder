import type { Context } from 'hono';
import { authService } from '@/services/auth';
import { LoginPayloadSchema } from '@/schemas/auth';
import {
  createErrorResponse,
  createValidationErrorResponse,
} from '@/utils/error_response';
import '@/types/hono';

export const authController = {
  async login(c: Context) {
    try {
      const body = await c.req.json();
      const parsed = LoginPayloadSchema.safeParse(body);
      if (!parsed.success) {
        return c.json(
          { error: createValidationErrorResponse(parsed.error) },
          400
        );
      }
      const { result, error } = await authService.login(parsed.data);
      if (error) return c.json({ error }, error.statusCode as 401);
      return c.json(result);
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },

  async me(c: Context) {
    const account = c.get('account');
    const { result, error } = await authService.getMe(Number(account.sub));
    if (error) return c.json({ error }, error.statusCode as 404);
    return c.json(result);
  },
};
