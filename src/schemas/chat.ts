import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z
  .object({
    clientId: z.string().min(1),
    messages: z.array(ChatMessageSchema).min(1),
  })
  .refine((data) => data.messages[data.messages.length - 1]?.role === 'user', {
    message: 'The last message must have role "user"',
    path: ['messages'],
  });

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResultSchema = z.object({
  reply: z.string(),
  intent: z.enum([
    'invoice_status',
    'seat_availability',
    'service_requests',
    'company_info',
    'general',
    'unknown',
  ]),
  confidence: z.number(),
  requires_human: z.boolean(),
  summary: z.string(),
});

export type ChatResult = z.infer<typeof ChatResultSchema>;

export type ChatMode = 'agent' | 'fallback';

export type ChatResponse = ChatResult & { mode: ChatMode };
