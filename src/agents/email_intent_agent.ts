import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

import { runStructuredToolLoop, type ToolArgs } from '@/agents/agent_loop';
import { getInvoicesForClient } from '@/services/mock_invoice_service';
import { getAvailableSeats } from '@/services/mock_seat_service';
import {
  EmailIntentResultSchema,
  type EmailIntentResult,
  type ProcessEmailPayload,
} from '@/schemas/email_processing';

const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_invoices_for_client',
      description:
        'Look up the invoices for a client by their email address. Optionally filter by an issued-date range (YYYY-MM-DD). Always call this when the client asks about invoices.',
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          client_email: {
            type: 'string',
            description: 'The email address of the client',
          },
          date_from: {
            type: ['string', 'null'],
            description:
              'Filter: issued on or after this date (YYYY-MM-DD), or null',
          },
          date_to: {
            type: ['string', 'null'],
            description:
              'Filter: issued on or before this date (YYYY-MM-DD), or null',
          },
        },
        required: ['client_email', 'date_from', 'date_to'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_available_seats',
      description:
        'Look up currently available seats/offices across KMC buildings. Optionally filter by city (Makati, BGC, Cebu) or seat type (dedicated_desk, private_office, meeting_room). Call this whenever a client asks about availability, seats, offices, or space.',
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          city: {
            type: ['string', 'null'],
            description: 'City filter (e.g., "Makati", "BGC", "Cebu") or null',
          },
          seat_type: {
            type: ['string', 'null'],
            description:
              'One of: "dedicated_desk", "private_office", "meeting_room", or null for all',
          },
        },
        required: ['city', 'seat_type'],
      },
    },
  },
];

function executeTool(name: string, args: ToolArgs): string {
  if (name === 'get_invoices_for_client') {
    const invoices = getInvoicesForClient({
      client_email: String(args.client_email ?? ''),
      date_from: args.date_from ? String(args.date_from) : undefined,
      date_to: args.date_to ? String(args.date_to) : undefined,
    });
    return JSON.stringify({ invoices, count: invoices.length });
  }
  if (name === 'get_available_seats') {
    const seats = getAvailableSeats({
      city: args.city ? String(args.city) : undefined,
      seat_type: args.seat_type ? String(args.seat_type) : undefined,
    });
    return JSON.stringify({ seats, count: seats.length });
  }
  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

function buildSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `You are the automated email assistant for KMC Solutions, a coworking and seat-leasing company in the Philippines. KMC operates flexible workspaces (dedicated desks, private offices, meeting rooms) in Makati, BGC, and Cebu. You reply to client emails directly with the actual answer.

WORKFLOW for each inbound email:
1. Classify the intent. Available intents:
   - get_invoices: client asking for invoices/billing records
   - check_invoice_status: client asking if an invoice is paid/unpaid/overdue
   - check_availability: client asking what seats/offices/meeting rooms are available
   - request_quote: client asking for pricing (use this when they ask "how much")
   - book_tour: client wanting to schedule a site visit
   - report_issue: client reporting a problem (slow wifi, broken AC, etc.)
   - general_inquiry: anything else conversational
   - unknown: cannot classify
2. If the request needs data, CALL THE APPROPRIATE TOOL before drafting the reply:
   - get_invoices, check_invoice_status -> get_invoices_for_client (use the From email)
   - check_availability, request_quote (when about seats) -> get_available_seats
3. Write a final reply that DIRECTLY answers what the client asked, with the actual data inline. End with a friendly closing line. NEVER include a signature line, name placeholder, or "Best regards" — the system appends those.

CRITICAL — the suggested_reply must contain the actual answer:
- DO NOT write "we will send you the invoices" or "let me check and get back to you" or "we will look into this."
- DO write "Here are your invoices for May 2026: ..." or "We have 12 dedicated desks available at V Corporate Centre, Makati at ₱16,000/month..." with the real numbers, amounts, and statuses inline.
- If a tool returns no matching data, say so plainly: "We don't currently have any private offices available in BGC, but we have X in Makati."
- Keep replies concise: greeting + the answer + a brief close. No signature placeholder.

Today's date is ${today}. Resolve relative dates ("May", "last month", "Q2") against this.

Never invent data. Only use what tools return.`;
}

export async function runEmailIntentAgent(
  email: ProcessEmailPayload
): Promise<EmailIntentResult> {
  const userMessage = `From: ${email.from.name} <${email.from.address}>
Subject: ${email.subject}

${email.body}`;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: userMessage },
  ];

  return runStructuredToolLoop<EmailIntentResult>({
    messages,
    tools: TOOLS,
    executeTool,
    schema: EmailIntentResultSchema,
    schemaName: 'email_intent',
  });
}
