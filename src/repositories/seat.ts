import { eq } from 'drizzle-orm';
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
