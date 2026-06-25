import postgres from 'postgres';
import { env } from '@/utils/env';

if (!env.DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(env.DATABASE_URL, { prepare: false });

async function main() {
  const tables = await sql<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;

  console.log('--- public tables ---');
  for (const t of tables) console.log(`  ${t.table_name}`);

  for (const t of tables) {
    const cols = await sql<
      { column_name: string; data_type: string; is_nullable: string }[]
    >`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${t.table_name}
      ORDER BY ordinal_position
    `;
    console.log(`\n=== ${t.table_name} (${cols.length} cols) ===`);
    for (const c of cols) {
      console.log(
        `  ${c.column_name.padEnd(28)} ${c.data_type.padEnd(20)} ${c.is_nullable === 'YES' ? 'nullable' : 'not null'}`
      );
    }

    const counts = await sql<{ count: bigint }[]>`
      SELECT count(*)::bigint AS count FROM ${sql(t.table_name)}
    `;
    console.log(`  rows: ${counts[0].count}`);
  }

  const enums = await sql<{ enum_name: string; values: string }[]>`
    SELECT t.typname AS enum_name, string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS values
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname
  `;
  console.log('\n--- enums ---');
  for (const e of enums) console.log(`  ${e.enum_name}: ${e.values}`);

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
