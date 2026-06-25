import { ServiceResponse } from '@/utils/service_response';
import {
  loadClientData,
  getClientProfile,
  answerWithFallback,
  routeIntent,
} from '@/services/client_assistant';
import { answerWithAgent } from '@/agents/client_chat_agent';
import type { ChatMessage, ChatResponse } from '@/schemas/chat';

const FALLBACK_INTENT_MAP: Record<string, ChatResponse['intent']> = {
  invoice: 'invoice_status',
  seats: 'seat_availability',
  service: 'service_requests',
  unknown: 'general',
};

export const chatService = {
  async processChat(payload: { clientId: string; messages: ChatMessage[] }) {
    const { clientId, messages } = payload;
    try {
      const data = loadClientData();
      if (!getClientProfile(data, clientId)) {
        return ServiceResponse.notFound('Unknown clientId');
      }

      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      if (!lastUser) {
        return ServiceResponse.badRequest(
          'messages must contain a user message'
        );
      }

      // Try the live agent first; fall back on missing key or agent error.
      try {
        const result = await answerWithAgent(clientId, messages);
        return ServiceResponse.success<ChatResponse>({
          ...result,
          mode: 'agent',
        });
      } catch (err) {
        console.warn(
          'chat agent failed, using fallback:',
          err instanceof Error ? err.message : err
        );
        // fall through to deterministic fallback below
      }

      const fb = answerWithFallback(data, clientId, lastUser.content);
      const intent =
        FALLBACK_INTENT_MAP[routeIntent(lastUser.content)] ?? 'general';
      return ServiceResponse.success<ChatResponse>({
        reply: fb.reply,
        intent,
        confidence: 0.3,
        requires_human: false,
        summary: fb.reply.slice(0, 140),
        mode: 'fallback',
      });
    } catch (err) {
      return ServiceResponse.internalServerError(
        'Failed to process chat',
        err instanceof Error ? err.message : err
      );
    }
  },
};
