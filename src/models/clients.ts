import { date, pgTable, text } from 'drizzle-orm/pg-core';

// NOTE: The live Supabase tables were created outside Drizzle (by another dev)
// and use plain `text` columns rather than Postgres enums, and have no
// created_at/updated_at columns. This schema mirrors the live DB. The enum
// literals are kept as TS-level unions via `text(..., { enum })` for type
// safety without requiring a Postgres enum type.

export const clients = pgTable('clients', {
  clientId: text('client_id').primaryKey(),
  companyName: text('company_name').notNull(),
  primaryContact: text('primary_contact').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  preferredChannel: text('preferred_channel', {
    enum: ['WhatsApp', 'Zendesk', 'Email'],
  }).notNull(),
  accountManager: text('account_manager').notNull(),
  clientSince: date('client_since', { mode: 'string' }).notNull(),
  contractType: text('contract_type', {
    enum: ['Monthly', 'Annual'],
  }).notNull(),
  status: text('status', { enum: ['Active', 'Inactive'] }).notNull(),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
