import { describe, it, expect, mock } from 'bun:test';

describe('answerWithAgent', () => {
  it('passes the message history to the loop and returns the structured result', async () => {
    let received: { schemaName?: string; messageCount?: number } = {};

    mock.module('@/agents/agent_loop', () => ({
      runStructuredToolLoop: async (opts: {
        schemaName: string;
        messages: unknown[];
      }) => {
        received = {
          schemaName: opts.schemaName,
          messageCount: opts.messages.length,
        };
        return {
          reply: 'You have 3 seats free.',
          intent: 'seat_availability',
          confidence: 0.9,
          requires_human: false,
          summary: 'seats',
        };
      },
    }));

    const { answerWithAgent } = await import('@/agents/client_chat_agent');
    const { loadClientData } = await import('@/services/client_assistant');
    const clientId = String(loadClientData().clients[0]!.clientId);

    const result = await answerWithAgent(clientId, [
      { role: 'user', content: 'how many seats are free?' },
    ]);

    expect(result.intent).toBe('seat_availability');
    expect(result.reply).toContain('seats');
    expect(received.schemaName).toBe('client_chat_result');
    // system prompt + 1 history message
    expect(received.messageCount).toBe(2);
  });
});
