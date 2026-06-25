import type {
  Client,
  Invoice,
  SeatRecord,
  ServiceRequest,
} from '@/services/mock_data';

const PHP = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
});

const COLORS: Record<string, { bg: string; fg: string }> = {
  Paid: { bg: '#d1fae5', fg: '#065f46' },
  Unpaid: { bg: '#fef3c7', fg: '#92400e' },
  Overdue: { bg: '#fee2e2', fg: '#991b1b' },
  Open: { bg: '#dbeafe', fg: '#1e40af' },
  'In Progress': { bg: '#e0e7ff', fg: '#3730a3' },
  Resolved: { bg: '#d1fae5', fg: '#065f46' },
  Low: { bg: '#e5e7eb', fg: '#374151' },
  Medium: { bg: '#fef3c7', fg: '#92400e' },
  High: { bg: '#fee2e2', fg: '#991b1b' },
};

function badge(text: string): string {
  const c = COLORS[text] ?? { bg: '#e5e7eb', fg: '#374151' };
  return `<span style="background:${c.bg};color:${c.fg};padding:4px 10px;border-radius:6px;font-size:12px;font-weight:500;white-space:nowrap;">${escape(text)}</span>`;
}

function escape(s: string | null | undefined): string {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label: string, value: string, first = false): string {
  const border = first ? '' : 'border-top:1px solid rgba(0,0,0,0.05);';
  return `<tr><td style="padding:10px 0;${border}font-size:13px;color:#6b7280;">${escape(label)}</td><td style="padding:10px 0;${border}font-size:14px;color:#1f2937;font-weight:500;text-align:right;">${value}</td></tr>`;
}

const CARD =
  'background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:24px;margin-bottom:12px;';

function cardHeader(left: string, right: string, gap = 20): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin-bottom:${gap}px;">
    <tr>
      <td style="text-align:left;vertical-align:middle;">${left}</td>
      <td style="text-align:right;vertical-align:middle;white-space:nowrap;">${right}</td>
    </tr>
  </table>`;
}
const CARD_LABEL =
  'font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;';
const CARD_ID = 'font-size:17px;font-weight:600;color:#111827;margin-top:2px;';
const SECTION_TITLE =
  'font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin:24px 0 12px;';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const parts = iso.split('-').map(Number);
  const [y, m, d] = parts;
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function renderInvoiceCard(inv: Invoice): string {
  const amount = `<span style="font-size:30px;font-weight:700;color:#111827;line-height:1;">${PHP.format(inv.amount_php)}</span>`;
  return `<div style="${CARD}">
    ${cardHeader(amount, badge(inv.status))}
    <table style="width:100%;border-collapse:collapse;">
      ${row('Invoice Number', escape(inv.invoice_number), true)}
      ${row('Date Issued', fmtDate(inv.issue_date))}
      ${row('Due Date', fmtDate(inv.due_date))}
      ${inv.paid_date ? row('Paid Date', fmtDate(inv.paid_date)) : ''}
    </table>
  </div>`;
}

function renderSeatCard(seat: SeatRecord): string {
  const left = `<div style="${CARD_LABEL}">Seat Allocation</div><div style="${CARD_ID}">${seat.total_seats} contracted seats</div>`;
  const right = `<span style="background:#dbeafe;color:#1e40af;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:500;">${escape(seat.occupancy_pct)} occupied</span>`;
  return `<div style="${CARD}">
    ${cardHeader(left, right)}
    <table style="width:100%;border-collapse:collapse;">
      ${row('Occupied', String(seat.seats_occupied), true)}
      ${row('Available', String(seat.seats_available))}
      ${row('Floor / Zone', escape(seat.floor_zone))}
      ${row('Daily Rate', PHP.format(seat.daily_rate_php))}
      ${row('Contract Ends', fmtDate(seat.contract_end))}
      ${row('Next Review', fmtDate(seat.next_review_date))}
    </table>
  </div>`;
}

function renderTicketCard(t: ServiceRequest): string {
  const left = `<div style="${CARD_LABEL}">${escape(t.request_type)}</div><div style="${CARD_ID}">${escape(t.ticket_id)}</div>`;
  const right = `${badge(t.priority)}&nbsp;${badge(t.status)}`;
  return `<div style="${CARD}">
    ${cardHeader(left, right)}
    <table style="width:100%;border-collapse:collapse;">
      ${row('Submitted', fmtDate(t.submitted_date), true)}
      ${row('Assigned To', escape(t.assigned_to))}
      ${t.days_open ? row('Days Open', String(t.days_open)) : ''}
      ${t.resolved_date ? row('Resolved', fmtDate(t.resolved_date)) : ''}
      ${t.client_notes ? row('Notes', escape(t.client_notes)) : ''}
    </table>
  </div>`;
}

type RenderInput = {
  intro: string;
  client?: Client | null;
  invoices?: Invoice[];
  seat?: SeatRecord | null;
  tickets?: ServiceRequest[];
};

export function renderEmailHtml(input: RenderInput): string {
  const { intro, client, invoices, seat, tickets } = input;

  const introHtml = intro
    .split(/\n\n+/)
    .map(
      (p) =>
        `<p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 16px;">${escape(p).replace(/\n/g, '<br>')}</p>`
    )
    .join('');

  const sections: string[] = [];

  if (invoices && invoices.length > 0) {
    sections.push(
      `<div style="${SECTION_TITLE}">Invoices · ${invoices.length}</div>${invoices.map(renderInvoiceCard).join('')}`
    );
  }
  if (seat) {
    sections.push(
      `<div style="${SECTION_TITLE}">Seat Allocation</div>${renderSeatCard(seat)}`
    );
  }
  if (tickets && tickets.length > 0) {
    sections.push(
      `<div style="${SECTION_TITLE}">Tickets · ${tickets.length}</div>${tickets.map(renderTicketCard).join('')}`
    );
  }

  const clientBadge = client
    ? `<div style="font-size:13px;color:#6b7280;margin-bottom:24px;">Account: <strong style="color:#111827;">${escape(client.company_name)}</strong></div>`
    : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;">
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1f2937;">
    ${introHtml}
    ${clientBadge}
    ${sections.join('')}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">KMC Solutions · Automated response</div>
  </div>
</body></html>`;
}
