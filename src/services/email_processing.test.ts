import { describe, it, expect, mock, beforeEach } from 'bun:test';
import type { EmailIntentResult } from '@/schemas/email_processing';

// Controlled agent + email-send mocks so no OpenAI/Graph calls happen.
let agentCalls = 0;
let agentResult: EmailIntentResult;
let sendCalls: Array<{ to: string[] }> = [];

mock.module('@/agents/email_intent_agent', () => ({
  runEmailIntentAgent: async () => {
    agentCalls += 1;
    return agentResult;
  },
}));

mock.module('@/services/email', () => ({
  emailService: {
    sendEmail: async (payload: { to: string[] }) => {
      sendCalls.push(payload);
      return { result: { id: 'sent' }, error: null };
    },
    markAsRead: async () => ({ result: {}, error: null }),
  },
}));

const { emailProcessingService } = await import('@/services/email_processing');

function makeIntent(intent: EmailIntentResult['intent']): EmailIntentResult {
  return {
    intent,
    date_range: null,
    invoice_numbers: [],
    document_types: [],
    summary: 'summary',
    suggested_reply: 'reply',
    requires_human: false,
    confidence: 0.9,
  };
}

function emailFrom(address: string) {
  return {
    from: { name: 'Sender', address },
    subject: 'Hello',
    body: 'Body text',
  };
}

describe('emailProcessingService.processAndForward', () => {
  beforeEach(() => {
    agentCalls = 0;
    sendCalls = [];
    agentResult = makeIntent('get_invoices');
  });

  it('skips automated senders without calling the agent or forwarding', async () => {
    const { result, error } = await emailProcessingService.processAndForward(
      emailFrom('no-reply@kmc.solutions')
    );
    expect(error).toBeNull();
    expect(result?.forwarded).toBe(false);
    expect(result?.reason).toBe('automated_sender');
    expect(agentCalls).toBe(0);
    expect(sendCalls.length).toBe(0);
  });

  it('does not forward when the intent is unknown', async () => {
    agentResult = makeIntent('unknown');
    const { result, error } = await emailProcessingService.processAndForward(
      emailFrom('jane@acme.com')
    );
    expect(error).toBeNull();
    expect(result?.forwarded).toBe(false);
    expect(result?.reason).toBe('non_forwardable_intent');
    expect(agentCalls).toBe(1);
    expect(sendCalls.length).toBe(0);
  });

  it('forwards actionable mail from a human sender', async () => {
    const { result, error } = await emailProcessingService.processAndForward(
      emailFrom('jane@acme.com')
    );
    expect(error).toBeNull();
    expect(result?.forwarded).toBe(true);
    expect(result?.forwarded_to).toBe('eugene.capalad@kmc.solutions');
    expect(sendCalls.length).toBe(1);
    expect(sendCalls[0]?.to).toContain('eugene.capalad@kmc.solutions');
  });
});
