import type { Context } from 'hono';
import { emailService } from '@/services/email';
import {
  SendEmailPayloadSchema,
  SendReplyPayloadSchema,
} from '@/schemas/email';
import {
  createErrorResponse,
  createValidationErrorResponse,
} from '@/utils/error_response';

export const emailController = {
  async listUnread(c: Context) {
    const { result, error } = await emailService.listUnreadMessages();
    if (error) return c.json({ error }, error.statusCode as 500);
    return c.json({ messages: result });
  },

  async listRecent(c: Context) {
    const { result, error } = await emailService.listRecentMessages();
    if (error) return c.json({ error }, error.statusCode as 500);
    return c.json({ messages: result });
  },

  async getById(c: Context) {
    const id = c.req.param('id')!;
    const { result, error } = await emailService.getMessageById(id);
    if (error) return c.json({ error }, error.statusCode as 500);
    return c.json(result);
  },

  async markAsRead(c: Context) {
    const id = c.req.param('id')!;
    const { result, error } = await emailService.markAsRead(id);
    if (error) return c.json({ error }, error.statusCode as 500);
    return c.json(result);
  },

  async reply(c: Context) {
    try {
      const id = c.req.param('id')!;
      const body = await c.req.json();
      const parsed = SendReplyPayloadSchema.safeParse(body);
      if (!parsed.success) {
        return c.json(
          { error: createValidationErrorResponse(parsed.error) },
          400
        );
      }
      const { result, error } = await emailService.replyToMessage(
        id,
        parsed.data
      );
      if (error) return c.json({ error }, error.statusCode as 500);
      return c.json(result);
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },

  async send(c: Context) {
    try {
      const body = await c.req.json();
      const parsed = SendEmailPayloadSchema.safeParse(body);
      if (!parsed.success) {
        return c.json(
          { error: createValidationErrorResponse(parsed.error) },
          400
        );
      }
      const { result, error } = await emailService.sendEmail(parsed.data);
      if (error) return c.json({ error }, error.statusCode as 500);
      return c.json(result);
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },
};
