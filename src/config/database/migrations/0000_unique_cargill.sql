CREATE TYPE "public"."email_intent" AS ENUM('get_invoices', 'check_invoice_status', 'check_availability', 'request_quote', 'book_tour', 'report_issue', 'general_inquiry', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."process_email_status" AS ENUM('processed', 'forwarded', 'failed');--> statement-breakpoint
CREATE TABLE "processed_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_message_id" text,
	"from_name" text NOT NULL,
	"from_address" text NOT NULL,
	"subject" text,
	"intent" "email_intent" DEFAULT 'unknown' NOT NULL,
	"intent_json" text,
	"status" "process_email_status" DEFAULT 'processed' NOT NULL,
	"forwarded_to" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
