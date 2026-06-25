import { z } from 'zod';

export const SendReplyPayloadSchema = z.object({
  content: z.string().min(1),
});

export const SendEmailPayloadSchema = z.object({
  to: z.array(z.string().email()).min(1),
  cc: z.array(z.string().email()).optional(),
  subject: z.string().min(1),
  content: z.string().min(1),
  isHtml: z.boolean().default(false),
});

export type SendReplyPayload = z.infer<typeof SendReplyPayloadSchema>;
export type SendEmailPayload = z.infer<typeof SendEmailPayloadSchema>;
