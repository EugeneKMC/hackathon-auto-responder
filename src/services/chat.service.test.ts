import { describe, it, expect, mock, beforeEach } from 'bun:test';
import type { ChatResult } from '@/schemas/chat';

// Mutable agent implementation so each test controls agent success/failure.
let agentImpl: (clientId: string, history: unknown[]) => Promise<ChatResult>;

mock.module('@/agents/client_chat_agent', () => ({
  answerWithAgent: (clientId: string, history: unknown[]) =>
    agentImpl(clientId, history),
}));

const { chatService } = await import('@/services/chat');
const { loadClientData } = await import('@/services/client_assistant');

const knownClientId = String(loadClientData().clients[0]!.clientId);

describe('chatService.processChat', () => {
  beforeEach(() => {
    agentImpl = async () => ({
      reply: 'Your latest invoice INV-1 is paid.',
      intent: 'invoice_status',
      confidence: 0.95,
      requires_human: false,
      summary: 'invoice paid',
    });
  });

  it('returns the agent result with mode "agent" for a known client', async () => {
    const { result, error } = await chatService.processChat({
      clientId: knownClientId,
      messages: [{ role: 'user', content: 'is my invoice paid?' }],
    });
    expect(error).toBeNull();
    expect(result?.mode).toBe('agent');
    expect(result?.intent).toBe('invoice_status');
    expect(result?.reply).toContain('invoice');
  });

  it('returns notFound for an unknown clientId', async () => {
    const { result, error } = await chatService.processChat({
      clientId: 'DOES-NOT-EXIST',
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(result).toBeNull();
    expect(error?.statusCode).toBe(404);
  });

  it('falls back to the keyword answerer when the agent throws', async () => {
    agentImpl = async () => {
      throw new Error('no api key');
    };
    const { result, error } = await chatService.processChat({
      clientId: knownClientId,
      messages: [{ role: 'user', content: 'how many seats are available?' }],
    });
    expect(error).toBeNull();
    expect(result?.mode).toBe('fallback');
    expect(result?.intent).toBe('seat_availability');
    expect(typeof result?.reply).toBe('string');
    expect(result?.reply.length).toBeGreaterThan(0);
  });

  it('returns badRequest when there is no user message', async () => {
    const { result, error } = await chatService.processChat({
      clientId: knownClientId,
      messages: [],
    });
    expect(result).toBeNull();
    expect(error?.statusCode).toBe(400);
  });
});
