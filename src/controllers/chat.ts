import type { Context } from 'hono';
import { loadClientData } from '@/services/client_assistant';
import { chatService } from '@/services/chat';
import { ChatRequestSchema } from '@/schemas/chat';
import { createValidationErrorResponse } from '@/utils/error_response';

export const chatController = {
  health(c: Context) {
    return c.json({ ok: true });
  },

  listClients(c: Context) {
    const data = loadClientData();
    return c.json(
      data.clients.map((cl) => ({
        clientId: cl.clientId,
        companyName: cl.companyName,
        preferredChannel: cl.preferredChannel,
      }))
    );
  },

  async chat(c: Context) {
    const body = await c.req.json().catch(() => ({}));
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { error: createValidationErrorResponse(parsed.error) },
        400
      );
    }

    const { result, error } = await chatService.processChat(parsed.data);
    if (error) return c.json({ error }, error.statusCode as 400);
    return c.json(result);
  },
};
