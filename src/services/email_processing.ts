import { runEmailIntentAgent } from '@/agents/email_intent_agent';
import { emailService } from '@/services/email';
import { getInvoicesForClient } from '@/repositories/invoice';
import { getSeatAllocationForClient } from '@/repositories/seat';
import { getServiceRequestsForClient } from '@/repositories/service_request';
import { CLIENTS } from '@/services/mock_data';
import { renderEmailHtml } from '@/services/email_template';
import { env } from '@/utils/env';
import { ServiceResponse } from '@/utils/service_response';
import {
  isAutomatedSender,
  isForwardableIntent,
} from '@/constants/email_filter';
import type { ProcessEmailPayload } from '@/schemas/email_processing';

function parseAllowedEmails(): string[] {
  return (env.ALLOWED_EMAIL ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

const AUTOMATED_SENDER_PATTERNS = [
  'noreply',
  'no-reply',
  'donotreply',
  'do-not-reply',
  'mailer-daemon',
  'postmaster',
  'bounce',
  'newsletter',
  'notification',
  'notifications',
  'marketing@',
  'alerts@',
  'alert@',
  'updates@',
];

const MIN_PLAIN_TEXT_LEN = 30;

function isAutomatedSender(address: string): boolean {
  const lower = address.toLowerCase();
  return AUTOMATED_SENDER_PATTERNS.some((p) => lower.includes(p));
}

function isLowSignalBody(body: string): boolean {
  return body.trim().length < MIN_PLAIN_TEXT_LEN;
}

// LLM sometimes returns the literal string "null" or quoted variants
// when asked for a nullable field. Treat all of those as null.
function normalizeNullable(value: string | null | undefined): string | null {
  if (value == null) return null;
  const stripped = value.replace(/^['"`]+|['"`]+$/g, '').trim();
  if (!stripped || stripped.toLowerCase() === 'null') return null;
  return stripped;
}

type AgentIntent = {
  client_id: string | null;
  intent: string;
  date_range: { from: string | null; to: string | null } | null;
  latest_only: boolean;
  include: { invoices: boolean; seats: boolean; tickets: boolean };
};

async function buildRenderInput(intro: string, intent: AgentIntent) {
  const clientId = normalizeNullable(intent.client_id);
  if (!clientId) return { intro };

  const client = CLIENTS.find((c) => c.client_id === clientId) ?? null;
  const companyName = client?.company_name ?? '';

  const wantInvoices = intent.include?.invoices === true;
  const wantSeat = intent.include?.seats === true;
  const wantTickets = intent.include?.tickets === true;

  const [invoicesRaw, seatRaw, ticketsRaw] = await Promise.all([
    wantInvoices
      ? getInvoicesForClient({
          client_id: clientId,
          date_from: intent.date_range?.from ?? null,
          date_to: intent.date_range?.to ?? null,
        })
      : Promise.resolve(undefined),
    wantSeat
      ? getSeatAllocationForClient({ client_id: clientId })
      : Promise.resolve(undefined),
    wantTickets
      ? getServiceRequestsForClient({
          client_id: clientId,
          status: 'active',
        })
      : Promise.resolve(undefined),
  ]);

  let invoices = invoicesRaw?.map((i) => ({
    invoice_id: i.invoiceId,
    client_id: i.clientId,
    company_name: companyName,
    invoice_number: i.invoiceNumber,
    issue_date: i.issueDate,
    due_date: i.dueDate,
    amount_php: Number(i.amountPhp),
    status: i.status,
    paid_date: i.paidDate,
    days_overdue: i.daysOverdue,
    billing_period: i.billingPeriod,
    description: i.description,
  }));
  if (invoices && intent.latest_only) {
    invoices = invoices.slice(0, 1);
  }

  const seat = seatRaw
    ? {
        seat_record_id: seatRaw.seatRecordId,
        client_id: seatRaw.clientId,
        company_name: companyName,
        total_seats: seatRaw.totalSeats,
        seats_occupied: seatRaw.seatsOccupied,
        seats_available: seatRaw.seatsAvailable,
        occupancy_pct: `${seatRaw.occupancyPct}%`,
        floor_zone: seatRaw.floorZone,
        daily_rate_php: Number(seatRaw.dailyRatePhp),
        contract_start: seatRaw.contractStart,
        contract_end: seatRaw.contractEnd,
        next_review_date: seatRaw.nextReviewDate,
        notes: seatRaw.notes,
      }
    : undefined;

  const tickets = ticketsRaw?.map((t) => ({
    ticket_id: t.ticketId,
    client_id: t.clientId,
    company_name: companyName,
    request_type: t.requestType,
    description: t.description,
    priority: t.priority,
    status: t.status,
    submitted_date: t.submittedDate,
    assigned_to: t.assignedTo,
    resolved_date: t.resolvedDate,
    days_open: t.daysOpen,
    client_notes: t.clientNotes,
  }));

  return { intro, client, invoices, seat, tickets };
}

export const emailProcessingService = {
  async processEmail(email: ProcessEmailPayload) {
    try {
      const intent = await runEmailIntentAgent(email);
      return ServiceResponse.success({
        from: email.from,
        subject: email.subject,
        intent,
      });
    } catch (err) {
      return ServiceResponse.internalServerError(
        'Failed to process email',
        err instanceof Error ? err.message : err
      );
    }
  },

  async processAndForward(
    email: ProcessEmailPayload,
    options?: { replyToMessageId?: string }
  ) {
    const allowed = parseAllowedEmails();

    if (allowed.length > 0) {
      if (!allowed.includes(email.from.address.toLowerCase())) {
        return ServiceResponse.success({
          skipped: true,
          reason: `sender not in ALLOWED_EMAIL list (${allowed.join(', ')})`,
        });
      }
    }

    if (isAutomatedSender(email.from.address)) {
      return ServiceResponse.success({
        skipped: true,
        reason: 'automated sender',
      });
    }

    // Loop guard: only skip when WE are the sender (our own polling mailbox).
    // User replies to our auto-responder are NOT loops — they're follow-ups.
    if (
      email.from.address.toLowerCase() === env.MS_GRAPH_USER_EMAIL.toLowerCase()
    ) {
      return ServiceResponse.success({
        skipped: true,
        reason: 'self-sent from the polling mailbox (loop guard)',
      });
    }

    if (isLowSignalBody(email.body)) {
      return ServiceResponse.success({
        skipped: true,
        reason:
          'body has no meaningful plain text (likely HTML-only / marketing)',
      });
    }

    const { result, error } = await this.processEmail(email);
    if (error || !result) {
      return ServiceResponse.internalServerError(
        error?.message ?? 'Processing returned no result',
        error?.details
      );
    }

    const reply = result.intent.suggested_reply?.trim();
    if (!reply) {
      return ServiceResponse.success({
        skipped: true,
        reason: 'agent produced no reply text',
        intent: result.intent,
      });
    }

    const replyTo = email.from.address;
    const html = renderEmailHtml(await buildRenderInput(reply, result.intent));

    // If we have a real Graph message ID, reply in-thread so it appears as
    // part of the same conversation in Outlook. Otherwise fall back to a
    // standalone sendMail (used by /simulate-inbound for testing).
    if (options?.replyToMessageId) {
      const { error: sendErr } = await emailService.sendHtmlReplyInThread(
        options.replyToMessageId,
        html
      );
      if (sendErr) {
        return ServiceResponse.internalServerError(
          `Failed to send threaded reply: ${sendErr.message}`,
          sendErr.details
        );
      }
      return ServiceResponse.success({
        forwarded_to: replyTo,
        threaded: true,
        intent: result.intent,
      });
    }

    const replySubject = email.subject.startsWith('[Auto-Responder]')
      ? email.subject
      : `[Auto-Responder] ${email.subject}`;
    const { error: sendErr } = await emailService.sendEmail({
      to: [replyTo],
      subject: replySubject,
      content: html,
      isHtml: true,
    });

    if (sendErr) {
      return ServiceResponse.internalServerError(
        `Failed to forward to ${replyTo}: ${sendErr.message}`,
        sendErr.details
      );
    }

    return ServiceResponse.success({
      forwarded_to: replyTo,
      threaded: false,
      intent: result.intent,
    });
  },
};
