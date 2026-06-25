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
  client_id: z.string().nullable(),
  company_name: z.string().nullable(),
  intent: z.enum([
    'get_invoices',
    'check_invoice_status',
    'seat_inquiry',
    'seat_change_request',
    'submit_ticket',
    'check_ticket_status',
    'contract_query',
    'account_summary',
    'general_inquiry',
    'unknown',
  ]),
  date_range: z
    .object({
      from: z.string().nullable(),
      to: z.string().nullable(),
    })
    .nullable(),
  latest_only: z.boolean(),
  include: z.object({
    invoices: z.boolean(),
    seats: z.boolean(),
    tickets: z.boolean(),
  }),
  invoice_numbers: z.array(z.string()),
  document_types: z.array(z.string()),
  summary: z.string(),
  suggested_reply: z.string(),
  requires_human: z.boolean(),
  confidence: z.number(),
});

export type EmailIntentResult = z.infer<typeof EmailIntentResultSchema>;
