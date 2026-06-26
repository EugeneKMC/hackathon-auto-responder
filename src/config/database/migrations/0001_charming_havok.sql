CREATE TABLE "invoices" (
	"invoice_id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"company_name" text,
	"invoice_number" text NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"amount_php" numeric NOT NULL,
	"status" text NOT NULL,
	"paid_date" date,
	"days_overdue" integer DEFAULT 0 NOT NULL,
	"billing_period" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seats" (
	"seat_record_id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"company_name" text,
	"total_seats" integer NOT NULL,
	"seats_occupied" integer NOT NULL,
	"seats_available" integer NOT NULL,
	"occupancy_pct" integer NOT NULL,
	"floor_zone" text NOT NULL,
	"daily_rate_php" numeric NOT NULL,
	"contract_start" date NOT NULL,
	"contract_end" date NOT NULL,
	"next_review_date" date NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"ticket_id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"company_name" text,
	"request_type" text NOT NULL,
	"description" text NOT NULL,
	"priority" text NOT NULL,
	"status" text NOT NULL,
	"submitted_date" date NOT NULL,
	"assigned_to" text NOT NULL,
	"resolved_date" date,
	"days_open" integer DEFAULT 0 NOT NULL,
	"client_notes" text
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"client_id" text PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"primary_contact" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"preferred_channel" text NOT NULL,
	"account_manager" text NOT NULL,
	"client_since" date NOT NULL,
	"contract_type" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_client_id_clients_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_client_id_clients_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public"."processed_emails" ALTER COLUMN "intent" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."email_intent";--> statement-breakpoint
CREATE TYPE "public"."email_intent" AS ENUM('get_invoices', 'check_invoice_status', 'seat_inquiry', 'seat_change_request', 'submit_ticket', 'check_ticket_status', 'contract_query', 'account_summary', 'general_inquiry', 'unknown');--> statement-breakpoint
ALTER TABLE "public"."processed_emails" ALTER COLUMN "intent" SET DATA TYPE "public"."email_intent" USING "intent"::"public"."email_intent";