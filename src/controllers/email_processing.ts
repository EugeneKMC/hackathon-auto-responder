import type { Context } from 'hono';
import { emailProcessingService } from '@/services/email_processing';
import { ProcessEmailPayloadSchema } from '@/schemas/email_processing';
import {
  createErrorResponse,
  createValidationErrorResponse,
} from '@/utils/error_response';

export const emailProcessingController = {
  async processMock(c: Context) {
    try {
      const body = await c.req.json();
      const parsed = ProcessEmailPayloadSchema.safeParse(body);
      if (!parsed.success) {
        return c.json(
          { error: createValidationErrorResponse(parsed.error) },
          400
        );
      }
      const { result, error } = await emailProcessingService.processEmail(
        parsed.data
      );
      if (error) return c.json({ error }, error.statusCode as 500);
      return c.json(result);
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },

  async simulateInbound(c: Context) {
    try {
      const body = await c.req.json();
      const parsed = ProcessEmailPayloadSchema.safeParse(body);
      if (!parsed.success) {
        return c.json(
          { error: createValidationErrorResponse(parsed.error) },
          400
        );
      }
      const { result, error } =
        await emailProcessingService.processAndForward(parsed.data);
      if (error) return c.json({ error }, error.statusCode as 500);
      return c.json(result);
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },
};
