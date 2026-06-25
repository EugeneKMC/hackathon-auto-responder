import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/utils/env';

if (!env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Add your Supabase connection string to .env'
  );
}

// `prepare: false` is required when connecting through Supabase's
// transaction-mode pooler (port 6543) and is safe with direct connections too.
const queryClient = postgres(env.DATABASE_URL, { prepare: false });

export const db = drizzle(queryClient);
