import { sql } from 'drizzle-orm';
import { db } from '@/config/database/db';
import { accounts } from '@/models/accounts';

// Mock login accounts — one per client (CLT-001..008). All share the same
// password for hackathon testing. Idempotent: re-running re-hashes + upserts.
const PASSWORD = 'Love2test!';

const ACCOUNTS = [
  { email: 'maria@nexuslogistics.ph', name: 'Maria Santos', clientId: 'CLT-001' },
  { email: 'kevin@brightpathbpo.com', name: 'Kevin Tan', clientId: 'CLT-002' },
  { email: 'plim@horizonretail.com', name: 'Patricia Lim', clientId: 'CLT-003' },
  { email: 'ramon@aquacore.io', name: 'Ramon dela Cruz', clientId: 'CLT-004' },
  {
    email: 'elena@skybridgefinance.com',
    name: 'Elena Villanueva',
    clientId: 'CLT-005',
  },
  { email: 'dgo@pinnaclepharma.com', name: 'David Go', clientId: 'CLT-006' },
  { email: 'rbautista@coastal.ph', name: 'Rowena Bautista', clientId: 'CLT-007' },
  { email: 'areyes@urbanedge.com', name: 'Alicia Reyes', clientId: 'CLT-008' },
];

async function main() {
  console.log('Seeding mock login accounts ...');
  for (const a of ACCOUNTS) {
    const passwordHash = await Bun.password.hash(PASSWORD);
    await db
      .insert(accounts)
      .values({
        email: a.email.toLowerCase(),
        passwordHash,
        name: a.name,
        clientId: a.clientId,
      })
      .onConflictDoUpdate({
        target: accounts.email,
        set: {
          passwordHash: sql`excluded.password_hash`,
          name: sql`excluded.name`,
          clientId: sql`excluded.client_id`,
          updatedAt: sql`now()`,
        },
      });
    console.log(`✓ ${a.email} -> ${a.clientId}`);
  }
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
