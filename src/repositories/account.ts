import { eq } from 'drizzle-orm';
import { db } from '@/config/database/db';
import { accounts, type Account } from '@/models/accounts';

export async function findAccountByEmail(
  email: string
): Promise<Account | null> {
  const rows = await db
    .select()
    .from(accounts)
    .where(eq(accounts.email, email.trim().toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}

export async function findAccountById(id: number): Promise<Account | null> {
  const rows = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, id))
    .limit(1);
  return rows[0] ?? null;
}
