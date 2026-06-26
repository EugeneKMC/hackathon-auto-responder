import { zodResponseFormat } from 'openai/helpers/zod';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

import { getOpenAI } from '@/config/openai';
import { env } from '@/utils/env';
import { findClient } from '@/repositories/client';
import { getInvoicesForClient } from '@/repositories/invoice';
import { getSeatAllocationForClient } from '@/repositories/seat';
import { getServiceRequestsForClient } from '@/repositories/service_request';
import { CLIENTS } from '@/services/mock_data';
import {
  EmailIntentResultSchema,
  type EmailIntentResult,
  type ProcessEmailPayload,
} from '@/schemas/email_processing';

const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'find_client',
      description:
        'Resolve a KMC client account from the email body or sender. Pass ALL three signals you can extract: company name, primary contact full name, and sender email. The backend will try each in turn. Returns the matching client record (including client_id) or null. ALWAYS call this BEFORE any other tool.',
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          company: {
            type: ['string', 'null'],
            description:
              'Company name as stated in the email body or signature, e.g. "Nexus Logistics". Null if not stated.',
          },
          primary_contact: {
            type: ['string', 'null'],
            description:
              "Full name of the person the email claims to be from (e.g., 'David Go', 'Maria Santos'). Pull this from the body greeting ('I am David Go...'), the signature ('Thanks, David Go'), or a 'From' line. Null if no name is in the body.",
          },
          email: {
            type: ['string', 'null'],
            description: 'Sender email from the From header, or null.',
          },
        },
        required: ['company', 'primary_contact', 'email'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_invoices',
      description:
        'Get invoices for a client. Always sorted newest first. Use status to filter (Paid/Unpaid/Overdue). For "latest" or "most recent" invoice, take the first result.',
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          client_id: { type: 'string', description: 'e.g. "CLT-001"' },
          status: {
            type: ['string', 'null'],
            description: 'Filter: "Paid", "Unpaid", or "Overdue". Null = all.',
          },
          billing_period: {
            type: ['string', 'null'],
            description:
              'Filter by billing period string, e.g. "May 2026". Null = all.',
          },
          date_from: {
            type: ['string', 'null'],
            description: 'Issue date on/after YYYY-MM-DD, or null.',
          },
          date_to: {
            type: ['string', 'null'],
            description: 'Issue date on/before YYYY-MM-DD, or null.',
          },
        },
        required: [
          'client_id',
          'status',
          'billing_period',
          'date_from',
          'date_to',
        ],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_seat_allocation',
      description:
        "Get a client's contracted seat record: total seats, occupied, available, occupancy %, floor zone, daily rate, contract start/end, next review date, notes.",
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          client_id: { type: 'string', description: 'e.g. "CLT-001"' },
        },
        required: ['client_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_service_requests',
      description:
        "Get a client's support tickets, sorted newest first. Use status filter to find open work.",
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          client_id: { type: 'string', description: 'e.g. "CLT-001"' },
          status: {
            type: ['string', 'null'],
            description:
              'Filter: "Open" (literally Open), "In Progress" (literally In Progress), "Resolved", or "active" (Open + In Progress combined — use this when the user asks about open/outstanding/unresolved tickets). Null = all.',
          },
          request_type: {
            type: ['string', 'null'],
            description:
              'Filter: "Headcount Change", "Facilities", "IT Support", "Contract Query", "Access & Security", "Other". Null = all.',
          },
        },
        required: ['client_id', 'status', 'request_type'],
      },
    },
  },
];

type ToolArgs = Record<string, unknown>;

function str(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

async function executeTool(name: string, args: ToolArgs): Promise<string> {
  if (name === 'find_client') {
    const client = await findClient({
      company: str(args.company),
      primary_contact: str(args.primary_contact),
      email: str(args.email),
    });
    return JSON.stringify({ client });
  }
  if (name === 'get_invoices') {
    const invoices = await getInvoicesForClient({
      client_id: str(args.client_id),
      status: str(args.status),
      billing_period: str(args.billing_period),
      date_from: str(args.date_from),
      date_to: str(args.date_to),
    });
    return JSON.stringify({ invoices, count: invoices.length });
  }
  if (name === 'get_seat_allocation') {
    const seat = await getSeatAllocationForClient({
      client_id: str(args.client_id),
    });
    return JSON.stringify({ seat });
  }
  if (name === 'get_service_requests') {
    const tickets = await getServiceRequestsForClient({
      client_id: str(args.client_id),
      status: str(args.status),
      request_type: str(args.request_type),
    });
    return JSON.stringify({ tickets, count: tickets.length });
  }
  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

function buildSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  const knownClients = CLIENTS.map((c) => `- ${c.company_name}`).join('\n');

  return `You are the automated email assistant for KMC Solutions — a workspace and outsourcing services provider in the Philippines. Clients are companies on Monthly or Annual contracts. They email you with billing questions, seat/headcount queries, support tickets, and contract questions. You reply with the actual answer pulled from our records.

Active KMC client accounts:
${knownClients}

INTENT CLASSIFICATION:
- get_invoices: requesting copies of one or more invoices
- check_invoice_status: asking whether a specific invoice is paid/unpaid/overdue, or asking about their "latest invoice"
- seat_inquiry: questions about their seat allocation (how many, occupancy, floor zone)
- seat_change_request: wanting to add or remove contracted seats
- submit_ticket: reporting a new issue (facilities, IT, access, etc.)
- check_ticket_status: asking about an existing service request (SR-XXXX)
- contract_query: questions about contract terms, renewal, end date
- account_summary: client asking for a general overview of their account
- general_inquiry: anything else conversational
- unknown: cannot classify

IMPORTANT — THREAD CONTEXT:
The email body may include a quoted reply thread (previous messages, often prefixed with "From:", "Sent:", or after lines like "---" or a divider). Read the WHOLE thread to understand the conversation. The newest message is at the TOP — that's what the sender just said. Below it is the prior conversation (our prior reply, the sender's original message). If the sender's newest message is a short answer to our earlier question (e.g., they just say "Nexus Logistics" because we asked "which company?"), combine that answer with the ORIGINAL request found further down the thread, and act on the original request now that you have the missing piece.

WORKFLOW (follow every step):
1. Classify the intent (taking the full thread into account, not just the topmost line).
2. IDENTIFY THE CLIENT — call find_client(company, primary_contact, email).
   - "company" must be the EXACT company name as it appears VERBATIM in the email body or signature. If no company is stated, pass null. NEVER guess from the active client list above — that list is for recognition only.
   - "primary_contact" is the full name the sender claims to be (e.g., "I'm David Go" or a signature "Thanks, David Go"). Each KMC client has ONE primary contact, so matching this name is a valid way to identify the client even when the company name isn't stated. Pull the FULL name. Pass null if no name appears in the body.
   - "email" is the sender's email address from the From header.
3. Branch on find_client result:
   3a. If find_client returns a client record:
       - Set client_id and company_name in your output to that record's values.
       - Call the relevant data tool(s):
         * get_invoices, check_invoice_status, account_summary -> get_invoices
         * seat_inquiry, seat_change_request, account_summary -> get_seat_allocation
         * check_ticket_status, submit_ticket, account_summary -> get_service_requests (use status="active" for "what's open?" / unresolved questions — includes Open AND In Progress)
       - Compose the final reply with the actual data inline.
   3b. If find_client returns null (client cannot be identified):
       - Set client_id and company_name to the JSON literal null (NOT the string "null").
       - Do NOT call any data tools. Do NOT invent data. Do NOT reference any company name.
       - Set intent="general_inquiry".
       - Set suggested_reply to a brief polite message asking the sender which KMC client company they represent so you can pull their records. Address them using the name from the body if stated, otherwise the From-header name. Example:
         "Hi Eugene, happy to help — could you confirm which KMC client company you're with so I can pull the right records? Thanks!"
       - Stop here.

INCLUDE FLAGS — exactly what the sender asked for (no extras):
You MUST decide what data sections appear in the reply by setting include.invoices, include.seats, include.tickets. Only set true for what the sender explicitly asks about. Examples:
- "Send me my invoice" -> include.invoices=true, include.seats=false, include.tickets=false
- "How many seats are open?" -> include.invoices=false, include.seats=true, include.tickets=false
- "What's the status of my latest invoice and current seat availability?" -> include.invoices=true, include.seats=true, include.tickets=false (NO tickets!)
- "Give me a full account overview" / "summarize my account" -> all three true
- "What's my latest invoice and any open tickets?" -> include.invoices=true, include.tickets=true, include.seats=false
DO NOT default to all-true. DO NOT include tickets unless the sender mentions tickets, issues, support, or asks for an overview. The intent classification is separate from this — the include flags determine what the reply actually renders.

SCOPE FLAG — latest_only (be precise, narrow scope):
- Set latest_only=true ONLY when the sender uses an explicit recency word: "latest", "most recent", "newest", "current", or "last" (when "last" means most-recent-in-time, not "last week").
- DO NOT set latest_only=true just because the sender uses a singular noun ("invoice" instead of "invoices"). "Send me my invoice for May" refers to May's invoice — it is a date-range query, not a latest-only query.
- When the sender names a month, quarter, or period ("for the month of May", "for June", "for Q2", "for 2026"), populate date_range accordingly and set latest_only=false.
- For "all invoices" or unscoped plural requests, set latest_only=false and leave date_range null.
- This flag only affects invoice rendering — seat allocation and tickets ignore it.

REPLY RULES (critical):
- The suggested_reply must be a SHORT plain-text intro only: greeting + 1–2 sentence framing + a brief closing line. THAT'S IT.
- DO NOT list invoice IDs, amounts, dates, statuses, seat counts, ticket IDs, ticket types, or any other concrete data in the suggested_reply. The system renders all that data as visual cards beneath your intro — duplicating it in text would show it twice.
- Examples of GOOD suggested_reply text:
  * "Hi Maria, here are your invoices for May. Let me know if you need anything else."
  * "Hi Eugene, here's a quick overview of your account. Happy to clarify any of these."
  * "Hi Patricia, listing your open tickets below. Reply if any need escalation."
  * "Hi Mark, your seat allocation is below. Reach out if you'd like to make changes."
- Examples of BAD suggested_reply text (DO NOT do this):
  * "Hi Maria, your invoices are: INV-001 ₱80,748 Paid; INV-002 ₱74,339 Paid; ..."  ← duplicates card data
  * "Hi Eugene, you have 10 total seats, 5 occupied, 5 available..."  ← duplicates card data
- ADDRESS the requester by the name they identify with in the email body (e.g., "this is Maria from Nexus" -> "Hi Maria,"). If no name is stated in the body, fall back to the name in the From header.
- If a tool returned no data (empty list), say so plainly in the intro: "Hi Patricia, you currently have no open tickets."
- End with a brief friendly close. NEVER append a signature, name placeholder, or "Best regards" — the system handles that.

Today's date is ${today}. Resolve relative dates ("May", "last month", "Q2") against it.

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

  const MAX_ITERATIONS = 6;

  const openai = getOpenAI();

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const completion = await openai.beta.chat.completions.parse({
      model: env.OPENAI_MODEL,
      messages,
      tools: TOOLS,
      response_format: zodResponseFormat(
        EmailIntentResultSchema,
        'email_intent'
      ),
    });

    const msg = completion.choices[0]?.message;
    if (!msg) throw new Error('Agent returned no message');

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push(msg);
      for (const tc of msg.tool_calls) {
        const args = JSON.parse(tc.function.arguments) as ToolArgs;
        const result = await executeTool(tc.function.name, args);
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: result,
        });
      }
      continue;
    }

    if (msg.parsed) return msg.parsed;

    const refusal = msg.refusal;
    throw new Error(
      refusal
        ? `Agent refused: ${refusal}`
        : 'Agent returned no tool call and no parsed result'
    );
  }

  throw new Error(`Agent exceeded ${MAX_ITERATIONS} iterations`);
}
