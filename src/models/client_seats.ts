import { date, integer, numeric, pgTable, text } from 'drizzle-orm/pg-core';
import { clients } from '@/models/clients';

// Live DB table is named `seats` (not `client_seats`). `occupancy_pct` is an
// integer (e.g. 50 = 50%) and `daily_rate_php` is numeric (returned as a string
// by postgres-js). The denormalized `company_name` exists in the live table.
export const clientSeats = pgTable('seats', {
  seatRecordId: text('seat_record_id').primaryKey(),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.clientId, { onDelete: 'cascade' }),
  companyName: text('company_name'),
  totalSeats: integer('total_seats').notNull(),
  seatsOccupied: integer('seats_occupied').notNull(),
  seatsAvailable: integer('seats_available').notNull(),
  occupancyPct: integer('occupancy_pct').notNull(),
  floorZone: text('floor_zone').notNull(),
  dailyRatePhp: numeric('daily_rate_php').notNull(),
  contractStart: date('contract_start', { mode: 'string' }).notNull(),
  contractEnd: date('contract_end', { mode: 'string' }).notNull(),
  nextReviewDate: date('next_review_date', { mode: 'string' }).notNull(),
  notes: text('notes'),
});

export type ClientSeat = typeof clientSeats.$inferSelect;
export type NewClientSeat = typeof clientSeats.$inferInsert;
