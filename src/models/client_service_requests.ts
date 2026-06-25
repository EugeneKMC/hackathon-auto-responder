import { date, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { clients } from '@/models/clients';

// Live DB table is named `service_requests` (not `client_service_requests`).
// request_type / priority / status are plain text columns in the live DB.
export const clientServiceRequests = pgTable('service_requests', {
  ticketId: text('ticket_id').primaryKey(),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.clientId, { onDelete: 'cascade' }),
  companyName: text('company_name'),
  requestType: text('request_type', {
    enum: [
      'Headcount Change',
      'Facilities',
      'IT Support',
      'Contract Query',
      'Access & Security',
      'Other',
    ],
  }).notNull(),
  description: text('description').notNull(),
  priority: text('priority', { enum: ['Low', 'Medium', 'High'] }).notNull(),
  status: text('status', {
    enum: ['Open', 'In Progress', 'Resolved'],
  }).notNull(),
  submittedDate: date('submitted_date', { mode: 'string' }).notNull(),
  assignedTo: text('assigned_to').notNull(),
  resolvedDate: date('resolved_date', { mode: 'string' }),
  daysOpen: integer('days_open').notNull().default(0),
  clientNotes: text('client_notes'),
});

export type ClientServiceRequest = typeof clientServiceRequests.$inferSelect;
export type NewClientServiceRequest = typeof clientServiceRequests.$inferInsert;
