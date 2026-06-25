import type { Context } from 'hono';
import {
  answerWithFallback,
  getClientProfile,
  loadClientData,
} from '@/services/client_assistant';
import { answerWithAgent } from '@/agents/client_chat_agent';
import { isOpenAIKeyValid } from '@/config/openai';

// Powers the 3am-client-assistant web chat. When OPENAI_API_KEY is present
// AND accepted by OpenAI the live tool-using agent answers; otherwise we fall
// back to deterministic keyword routing (answers are still correct, just not
// AI-generated).

export const chatController = {
  async health(c: Context) {
    const agent = await isOpenAIKeyValid();
    return c.json({ ok: true, mode: agent ? 'agent' : 'fallback' });
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
    const body = (await c.req.json().catch(() => ({}))) as {
      clientId?: string;
      message?: string;
    };
    const { clientId, message } = body;
    if (!clientId || !message) {
      return c.json({ error: 'clientId and message are required' }, 400);
    }

    const data = loadClientData();
    if (!getClientProfile(data, clientId)) {
      return c.json({ error: 'unknown clientId' }, 404);
    }

    const useAgent = await isOpenAIKeyValid();
    try {
      const result = useAgent
        ? await answerWithAgent(clientId, message)
        : answerWithFallback(data, clientId, message);
      return c.json({ ...result, mode: useAgent ? 'agent' : 'fallback' });
    } catch (err) {
      console.error(
        'chat error, using fallback:',
        err instanceof Error ? err.message : err
      );
      const result = answerWithFallback(data, clientId, message);
      return c.json({ ...result, mode: 'fallback' });
    }
  },
};
