import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { clients } from '@/models/clients';

// Mock-auth accounts. Each account is linked 1:1 to a client so a logged-in
// user only ever sees their own client's data. Passwords are stored hashed
// (Bun.password / argon2) — never plaintext.
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.clientId, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
