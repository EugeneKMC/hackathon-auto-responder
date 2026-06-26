import { eq, isNotNull, sql } from 'drizzle-orm';
import { db } from '@/config/database/db';
import { clientSeats, type ClientSeat } from '@/models/client_seats';

export async function getSeatAllocationForClient(args: {
  client_id?: string | null;
}): Promise<ClientSeat | null> {
  if (!args.client_id) return null;
  const rows = await db
    .select()
    .from(clientSeats)
    .where(eq(clientSeats.clientId, args.client_id))
    .limit(1);
  return rows[0] ?? null;
}

export type CompanyLocation = {
  location: string;
  client_records: number;
  total_seats: number;
  seats_available: number;
};

// Company-wide (not client-scoped): distinct office locations and their
// aggregate seat counts. Powers "how many / which locations" questions.
export async function getCompanyLocations(): Promise<CompanyLocation[]> {
  const rows = await db
    .select({
      location: clientSeats.location,
      client_records: sql<number>`count(*)::int`,
      total_seats: sql<number>`coalesce(sum(${clientSeats.totalSeats}), 0)::int`,
      seats_available: sql<number>`coalesce(sum(${clientSeats.seatsAvailable}), 0)::int`,
    })
    .from(clientSeats)
    .where(isNotNull(clientSeats.location))
    .groupBy(clientSeats.location)
    .orderBy(clientSeats.location);
  return rows as CompanyLocation[];
}
