import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { EmailIntent } from '@/constants/email_intent';

export const emailIntentEnum = pgEnum('email_intent', [
  EmailIntent.GET_INVOICES,
  EmailIntent.CHECK_INVOICE_STATUS,
  EmailIntent.CHECK_AVAILABILITY,
  EmailIntent.REQUEST_QUOTE,
  EmailIntent.BOOK_TOUR,
  EmailIntent.REPORT_ISSUE,
  EmailIntent.GENERAL_INQUIRY,
  EmailIntent.UNKNOWN,
]);

export const processEmailStatusEnum = pgEnum('process_email_status', [
  'processed',
  'forwarded',
  'failed',
]);

export const processedEmails = pgTable('processed_emails', {
  id: serial('id').primaryKey(),
  graphMessageId: text('graph_message_id'),
  fromName: text('from_name').notNull(),
  fromAddress: text('from_address').notNull(),
  subject: text('subject'),
  intent: emailIntentEnum('intent').notNull().default(EmailIntent.UNKNOWN),
  intentJson: text('intent_json'),
  status: processEmailStatusEnum('status').notNull().default('processed'),
  forwardedTo: text('forwarded_to'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type ProcessedEmail = typeof processedEmails.$inferSelect;
export type NewProcessedEmail = typeof processedEmails.$inferInsert;
