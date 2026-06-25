export type Invoice = {
  id: string;
  client_email: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'overdue';
  issued_date: string;
  due_date: string;
  description: string;
};

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-0501',
    client_email: 'alice@acme.com',
    amount: 25000,
    currency: 'PHP',
    status: 'paid',
    issued_date: '2026-05-03',
    due_date: '2026-06-03',
    description: 'Coworking membership - May 2026',
  },
  {
    id: 'INV-2026-0512',
    client_email: 'alice@acme.com',
    amount: 12500,
    currency: 'PHP',
    status: 'unpaid',
    issued_date: '2026-05-12',
    due_date: '2026-06-12',
    description: 'Meeting room hours - May 2026',
  },
  {
    id: 'INV-2026-0523',
    client_email: 'alice@acme.com',
    amount: 4500,
    currency: 'PHP',
    status: 'unpaid',
    issued_date: '2026-05-23',
    due_date: '2026-06-23',
    description: 'Printing services - May 2026',
  },
  {
    id: 'INV-2026-0418',
    client_email: 'alice@acme.com',
    amount: 25000,
    currency: 'PHP',
    status: 'paid',
    issued_date: '2026-04-18',
    due_date: '2026-05-18',
    description: 'Coworking membership - April 2026',
  },
  {
    id: 'INV-2026-0601',
    client_email: 'eugene.capalad@kmc.solutions',
    amount: 15000,
    currency: 'PHP',
    status: 'unpaid',
    issued_date: '2026-06-01',
    due_date: '2026-07-01',
    description: 'Consulting services - June 2026',
  },
];

export function getInvoicesForClient(args: {
  client_email: string;
  date_from?: string;
  date_to?: string;
}): Invoice[] {
  const email = args.client_email.toLowerCase();
  return MOCK_INVOICES.filter((inv) => {
    if (inv.client_email.toLowerCase() !== email) return false;
    if (args.date_from && inv.issued_date < args.date_from) return false;
    if (args.date_to && inv.issued_date > args.date_to) return false;
    return true;
  });
}
