import { loadClientData, type ClientData, type Row } from '@/config/client_data';

// Ported from the 3am-client-assistant Express server (tools.js + fallback.js).
// Read-only lookups over the client dataset plus a deterministic keyword
// fallback used when no OpenAI key is configured (or the agent errors).

export const HOW_TO_RAISE =
  'To raise a new service request, reply here with: (1) the request type ' +
  '(IT Support, Facilities, Access & Security, Headcount Change, Contract Query, or Other), ' +
  '(2) a short description, and (3) the priority (Low/Medium/High). ' +
  'Your account manager and the relevant team will be notified automatically.';

export type FallbackResult = { reply: string; toolUsed: string };

export function getClientProfile(data: ClientData, clientId: string): Row | null {
  return data.clients.find((c) => c.clientId === clientId) ?? null;
}

export function getLatestInvoice(data: ClientData, clientId: string) {
  const rows = data.invoices.filter((i) => i.clientId === clientId);
  if (rows.length === 0) return null;
  rows.sort((a, b) =>
    a.issueDate < b.issueDate ? 1 : a.issueDate > b.issueDate ? -1 : 0
  );
  const inv = rows[0]!;
  return {
    invoiceNumber: inv.invoiceNumber,
    amountPhp: inv.amountPhp,
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    daysOverdue: inv.daysOverdue,
    paidDate: inv.paidDate,
  };
}

export function getSeats(data: ClientData, clientId: string) {
  const s = data.seats.find((x) => x.clientId === clientId);
  if (!s) return null;
  return {
    totalSeats: s.totalSeats,
    seatsOccupied: s.seatsOccupied,
    seatsAvailable: s.seatsAvailable,
    occupancyPct: s.occupancyPct,
    floorZone: s.floorZone,
  };
}

export function getOpenServiceRequests(data: ClientData, clientId: string) {
  const open = data.serviceRequests
    .filter(
      (r) =>
        r.clientId === clientId &&
        (r.status === 'Open' || r.status === 'In Progress')
    )
    .map((r) => ({
      ticketId: r.ticketId,
      requestType: r.requestType,
      priority: r.priority,
      status: r.status,
      submittedDate: r.submittedDate,
      assignedTo: r.assignedTo,
      daysOpen: r.daysOpen,
    }));
  return { count: open.length, requests: open, howToRaise: HOW_TO_RAISE };
}

const peso = (n: unknown) => `₱${Number(n).toLocaleString('en-PH')}`;

export function routeIntent(message: string): string {
  const m = message.toLowerCase();
  if (/invoice|bill|payment|\bpay\b|overdue/.test(m)) return 'invoice';
  if (/seat|desk|capacity|available|occupanc/.test(m)) return 'seats';
  if (/service|request|ticket|support|raise|issue/.test(m)) return 'service';
  return 'unknown';
}

export function answerWithFallback(
  data: ClientData,
  clientId: string,
  message: string
): FallbackResult {
  const client = getClientProfile(data, clientId);
  const name = client ? String(client.companyName) : 'there';
  const intent = routeIntent(message);

  if (intent === 'invoice') {
    const inv = getLatestInvoice(data, clientId);
    if (!inv)
      return {
        reply: `I couldn't find any invoices for ${name}.`,
        toolUsed: 'getLatestInvoice',
      };
    const overdue = inv.status === 'Overdue' || inv.status === 'Unpaid';
    const tail = inv.paidDate
      ? ` It was paid on ${inv.paidDate}.`
      : overdue
        ? ` It is currently ${inv.status} and due ${inv.dueDate}.`
        : ` It is ${inv.status}, due ${inv.dueDate}.`;
    return {
      reply: `Your latest invoice is ${inv.invoiceNumber} for ${peso(inv.amountPhp)}.${tail}`,
      toolUsed: 'getLatestInvoice',
    };
  }

  if (intent === 'seats') {
    const s = getSeats(data, clientId);
    if (!s)
      return {
        reply: `I couldn't find a seat record for ${name}.`,
        toolUsed: 'getSeats',
      };
    const avail =
      Number(s.seatsAvailable) > 0
        ? `${s.seatsAvailable} of your ${s.totalSeats} seats are available`
        : `all ${s.totalSeats} seats are occupied`;
    return {
      reply: `You have ${s.totalSeats} contracted seats (${s.seatsOccupied} occupied). Right now ${avail}, on ${s.floorZone}.`,
      toolUsed: 'getSeats',
    };
  }

  if (intent === 'service') {
    const r = getOpenServiceRequests(data, clientId);
    if (r.count === 0) {
      return {
        reply: `You have no open service requests right now. ${r.howToRaise}`,
        toolUsed: 'getOpenServiceRequests',
      };
    }
    const lines = r.requests
      .map(
        (x) =>
          `• ${x.ticketId} — ${x.requestType} (${x.priority}), ${x.status}, with ${x.assignedTo}, open ${x.daysOpen} days`
      )
      .join('\n');
    return {
      reply: `You have ${r.count} open service request(s):\n${lines}\n\n${r.howToRaise}`,
      toolUsed: 'getOpenServiceRequests',
    };
  }

  return {
    reply: `Hi ${name}! I can help with three things: your latest invoice, your seat availability, and your open service requests. Which would you like?`,
    toolUsed: 'none',
  };
}

// Re-export the loader for convenience.
export { loadClientData };
