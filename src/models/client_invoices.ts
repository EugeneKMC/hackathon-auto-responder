import { date, integer, numeric, pgTable, text } from 'drizzle-orm/pg-core';
import { clients } from '@/models/clients';

// Live DB table is named `invoices` (not `client_invoices`). `amount_php` is
// numeric (returned as a string by postgres-js). `status` is plain text.
export const clientInvoices = pgTable('invoices', {
  invoiceId: text('invoice_id').primaryKey(),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.clientId, { onDelete: 'cascade' }),
  companyName: text('company_name'),
  invoiceNumber: text('invoice_number').notNull(),
  issueDate: date('issue_date', { mode: 'string' }).notNull(),
  dueDate: date('due_date', { mode: 'string' }).notNull(),
  amountPhp: numeric('amount_php').notNull(),
  status: text('status', { enum: ['Paid', 'Unpaid', 'Overdue'] }).notNull(),
  paidDate: date('paid_date', { mode: 'string' }),
  daysOverdue: integer('days_overdue').notNull().default(0),
  billingPeriod: text('billing_period').notNull(),
  description: text('description').notNull(),
});

export type ClientInvoice = typeof clientInvoices.$inferSelect;
export type NewClientInvoice = typeof clientInvoices.$inferInsert;
