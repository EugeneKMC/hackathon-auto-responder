import { z } from 'zod';

export const ProcessEmailPayloadSchema = z.object({
  from: z.object({
    name: z.string().default(''),
    address: z.string().email(),
  }),
  subject: z.string(),
  body: z.string(),
});

export type ProcessEmailPayload = z.infer<typeof ProcessEmailPayloadSchema>;

export const EmailIntentResultSchema = z.object({
  intent: z.enum([
    'get_invoices',
    'check_invoice_status',
    'check_availability',
    'request_quote',
    'book_tour',
    'report_issue',
    'general_inquiry',
    'unknown',
  ]),
  date_range: z
    .object({
      from: z.string().nullable(),
      to: z.string().nullable(),
    })
    .nullable(),
  invoice_numbers: z.array(z.string()),
  document_types: z.array(z.string()),
  summary: z.string(),
  suggested_reply: z.string(),
  requires_human: z.boolean(),
  confidence: z.number(),
});

export type EmailIntentResult = z.infer<typeof EmailIntentResultSchema>;
