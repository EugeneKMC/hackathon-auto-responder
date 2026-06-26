import { describe, it, expect } from 'bun:test';
import { ChatRequestSchema } from '@/schemas/chat';

describe('ChatRequestSchema', () => {
  it('accepts a valid multi-turn request ending with a user message', () => {
    const parsed = ChatRequestSchema.safeParse({
      clientId: 'C001',
      messages: [
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
        { role: 'user', content: 'is my invoice paid?' },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects when the last message is not from the user', () => {
    const parsed = ChatRequestSchema.safeParse({
      clientId: 'C001',
      messages: [{ role: 'assistant', content: 'hello' }],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an empty messages array', () => {
    const parsed = ChatRequestSchema.safeParse({
      clientId: 'C001',
      messages: [],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a missing clientId', () => {
    const parsed = ChatRequestSchema.safeParse({
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(parsed.success).toBe(false);
  });
});
