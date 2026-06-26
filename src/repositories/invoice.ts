import { and, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '@/config/database/db';
import { clientInvoices, type ClientInvoice } from '@/models/client_invoices';

export async function getInvoicesForClient(args: {
  client_id?: string | null;
  status?: string | null;
  billing_period?: string | null;
  date_from?: string | null;
  date_to?: string | null;
}): Promise<ClientInvoice[]> {
  const conditions: SQL[] = [];

  if (args.client_id) {
    conditions.push(eq(clientInvoices.clientId, args.client_id));
  }
  if (args.status) {
    conditions.push(
      sql`lower(${clientInvoices.status}::text) = ${args.status.toLowerCase()}`
    );
  }
  if (args.billing_period) {
    conditions.push(
      ilike(clientInvoices.billingPeriod, `%${args.billing_period}%`)
    );
  }
  if (args.date_from) {
    conditions.push(gte(clientInvoices.issueDate, args.date_from));
  }
  if (args.date_to) {
    conditions.push(lte(clientInvoices.issueDate, args.date_to));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  return db
    .select()
    .from(clientInvoices)
    .where(where)
    .orderBy(desc(clientInvoices.issueDate));
}

export async function getInvoiceByIdForClient(
  clientId: string,
  invoiceId: string
): Promise<ClientInvoice | null> {
  const rows = await db
    .select()
    .from(clientInvoices)
    .where(
      and(
        eq(clientInvoices.invoiceId, invoiceId),
        eq(clientInvoices.clientId, clientId)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}
