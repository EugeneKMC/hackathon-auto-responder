import {
  getInvoiceByIdForClient,
  getInvoicesForClient,
} from '@/repositories/invoice';
import { runSearch } from '@/services/search_filter';
import { ServiceResponse } from '@/utils/service_response';
import type { ClientInvoice } from '@/models/client_invoices';
import type { Invoice, InvoicePreview } from '@/types/dashboard';

function mapStatus(status: string): Invoice['status'] {
  switch (status) {
    case 'Paid':
      return 'paid';
    case 'Overdue':
      return 'overdue';
    default:
      return 'pending'; // Unpaid
  }
}

function mapInvoice(i: ClientInvoice): Invoice {
  return {
    id: i.invoiceId,
    invoiceNumber: i.invoiceNumber,
    amount: Number(i.amountPhp),
    currency: 'PHP',
    status: mapStatus(i.status),
    issuedDate: i.issueDate,
    dueDate: i.dueDate,
  };
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const invoiceService = {
  // Most recent invoice (by issue date) + next upcoming invoice (earliest due
  // date that is today or later). Either may be null.
  async getPreview(clientId: string) {
    // Repository returns rows already ordered by issue_date desc.
    const rows = await getInvoicesForClient({ client_id: clientId });

    const latest = rows[0] ? mapInvoice(rows[0]) : null;

    const today = todayIso();
    const upcoming = rows
      .filter((r) => r.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const incoming = upcoming[0] ? mapInvoice(upcoming[0]) : null;

    const preview: InvoicePreview = { latest, incoming };
    return ServiceResponse.success(preview);
  },

  // Full list mapped to the contract shape; controller handles paging.
  // direction sorts by issue date.
  async list(clientId: string, direction: 'asc' | 'desc', search?: string) {
    const rows = await getInvoicesForClient({ client_id: clientId });
    const items = rows.map(mapInvoice); // desc by issue date from repo
    if (direction === 'asc') items.reverse();

    const { items: filtered, ai } = await runSearch({
      items,
      search,
      resource: 'invoices',
      today: todayIso(),
      allowedStatuses: ['paid', 'pending', 'overdue'],
      accessors: {
        date: (i) => i.issuedDate,
        status: (i) => i.status,
        text: (i) => `${i.invoiceNumber} ${i.status} ${i.currency} ${i.amount}`,
      },
    });

    return ServiceResponse.success({ items: filtered, ai });
  },

  async getById(clientId: string, invoiceId: string) {
    const row = await getInvoiceByIdForClient(clientId, invoiceId);
    if (!row) return ServiceResponse.notFound('Invoice not found');
    return ServiceResponse.success(mapInvoice(row));
  },
};
