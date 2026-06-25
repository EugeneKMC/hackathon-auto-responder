import { and, desc, eq, ne, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '@/config/database/db';
import {
  clientServiceRequests,
  type ClientServiceRequest,
  type NewClientServiceRequest,
} from '@/models/client_service_requests';

export async function getServiceRequestsForClient(args: {
  client_id?: string | null;
  status?: string | null;
  request_type?: string | null;
}): Promise<ClientServiceRequest[]> {
  const conditions: SQL[] = [];

  if (args.client_id) {
    conditions.push(eq(clientServiceRequests.clientId, args.client_id));
  }

  if (args.status) {
    const s = args.status.toLowerCase();
    if (s === 'active') {
      // "active" = anything not Resolved (Open + In Progress)
      conditions.push(ne(clientServiceRequests.status, 'Resolved'));
    } else {
      conditions.push(sql`lower(${clientServiceRequests.status}::text) = ${s}`);
    }
  }

  if (args.request_type) {
    conditions.push(
      sql`lower(${clientServiceRequests.requestType}::text) = ${args.request_type.toLowerCase()}`
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  return db
    .select()
    .from(clientServiceRequests)
    .where(where)
    .orderBy(desc(clientServiceRequests.submittedDate));
}

export async function getServiceRequestByIdForClient(
  clientId: string,
  ticketId: string
): Promise<ClientServiceRequest | null> {
  const rows = await db
    .select()
    .from(clientServiceRequests)
    .where(
      and(
        eq(clientServiceRequests.ticketId, ticketId),
        eq(clientServiceRequests.clientId, clientId)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

// Highest numeric suffix across all ticket ids (e.g. "SR-0042" -> 42), used to
// mint the next ticket id. Dataset is small; a full scan is fine.
export async function getMaxTicketNumber(): Promise<number> {
  const rows = await db
    .select({ id: clientServiceRequests.ticketId })
    .from(clientServiceRequests);
  let max = 0;
  for (const r of rows) {
    const m = /(\d+)$/.exec(r.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

export async function insertServiceRequest(
  values: NewClientServiceRequest
): Promise<ClientServiceRequest> {
  const [row] = await db
    .insert(clientServiceRequests)
    .values(values)
    .returning();
  return row;
}

export async function updateServiceRequestForClient(
  clientId: string,
  ticketId: string,
  set: Partial<NewClientServiceRequest>
): Promise<ClientServiceRequest | null> {
  const [row] = await db
    .update(clientServiceRequests)
    .set(set)
    .where(
      and(
        eq(clientServiceRequests.ticketId, ticketId),
        eq(clientServiceRequests.clientId, clientId)
      )
    )
    .returning();
  return row ?? null;
}
