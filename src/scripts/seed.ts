import { sql } from 'drizzle-orm';
import { db } from '@/config/database/db';
import { clients } from '@/models/clients';
import { clientSeats } from '@/models/client_seats';
import { clientInvoices } from '@/models/client_invoices';
import { clientServiceRequests } from '@/models/client_service_requests';
import {
  CLIENTS,
  SEATS,
  INVOICES,
  SERVICE_REQUESTS,
} from '@/services/mock_data';

async function seedClients() {
  const rows = CLIENTS.map((c) => ({
    clientId: c.client_id,
    companyName: c.company_name,
    primaryContact: c.primary_contact,
    email: c.email,
    phone: c.phone,
    preferredChannel: c.preferred_channel,
    accountManager: c.account_manager,
    clientSince: c.client_since,
    contractType: c.contract_type,
    status: c.status,
  }));

  await db
    .insert(clients)
    .values(rows)
    .onConflictDoUpdate({
      target: clients.clientId,
      set: {
        companyName: sql`excluded.company_name`,
        primaryContact: sql`excluded.primary_contact`,
        email: sql`excluded.email`,
        phone: sql`excluded.phone`,
        preferredChannel: sql`excluded.preferred_channel`,
        accountManager: sql`excluded.account_manager`,
        clientSince: sql`excluded.client_since`,
        contractType: sql`excluded.contract_type`,
        status: sql`excluded.status`,
      },
    });

  console.log(`✓ clients: ${rows.length} upserted`);
}

async function seedSeats() {
  const rows = SEATS.map((s) => ({
    seatRecordId: s.seat_record_id,
    clientId: s.client_id,
    totalSeats: s.total_seats,
    seatsOccupied: s.seats_occupied,
    seatsAvailable: s.seats_available,
    occupancyPct: parseInt(s.occupancy_pct, 10),
    floorZone: s.floor_zone,
    dailyRatePhp: String(s.daily_rate_php),
    contractStart: s.contract_start,
    contractEnd: s.contract_end,
    nextReviewDate: s.next_review_date,
    notes: s.notes,
  }));

  await db
    .insert(clientSeats)
    .values(rows)
    .onConflictDoUpdate({
      target: clientSeats.seatRecordId,
      set: {
        clientId: sql`excluded.client_id`,
        totalSeats: sql`excluded.total_seats`,
        seatsOccupied: sql`excluded.seats_occupied`,
        seatsAvailable: sql`excluded.seats_available`,
        occupancyPct: sql`excluded.occupancy_pct`,
        floorZone: sql`excluded.floor_zone`,
        dailyRatePhp: sql`excluded.daily_rate_php`,
        contractStart: sql`excluded.contract_start`,
        contractEnd: sql`excluded.contract_end`,
        nextReviewDate: sql`excluded.next_review_date`,
        notes: sql`excluded.notes`,
      },
    });

  console.log(`✓ client_seats: ${rows.length} upserted`);
}

async function seedInvoices() {
  const rows = INVOICES.map((i) => ({
    invoiceId: i.invoice_id,
    clientId: i.client_id,
    invoiceNumber: i.invoice_number,
    issueDate: i.issue_date,
    dueDate: i.due_date,
    amountPhp: String(i.amount_php),
    status: i.status,
    paidDate: i.paid_date,
    daysOverdue: i.days_overdue,
    billingPeriod: i.billing_period,
    description: i.description,
  }));

  await db
    .insert(clientInvoices)
    .values(rows)
    .onConflictDoUpdate({
      target: clientInvoices.invoiceId,
      set: {
        clientId: sql`excluded.client_id`,
        invoiceNumber: sql`excluded.invoice_number`,
        issueDate: sql`excluded.issue_date`,
        dueDate: sql`excluded.due_date`,
        amountPhp: sql`excluded.amount_php`,
        status: sql`excluded.status`,
        paidDate: sql`excluded.paid_date`,
        daysOverdue: sql`excluded.days_overdue`,
        billingPeriod: sql`excluded.billing_period`,
        description: sql`excluded.description`,
      },
    });

  console.log(`✓ client_invoices: ${rows.length} upserted`);
}

async function seedServiceRequests() {
  const rows = SERVICE_REQUESTS.map((t) => ({
    ticketId: t.ticket_id,
    clientId: t.client_id,
    requestType: t.request_type,
    description: t.description,
    priority: t.priority,
    status: t.status,
    submittedDate: t.submitted_date,
    assignedTo: t.assigned_to,
    resolvedDate: t.resolved_date,
    daysOpen: t.days_open,
    clientNotes: t.client_notes,
  }));

  await db
    .insert(clientServiceRequests)
    .values(rows)
    .onConflictDoUpdate({
      target: clientServiceRequests.ticketId,
      set: {
        clientId: sql`excluded.client_id`,
        requestType: sql`excluded.request_type`,
        description: sql`excluded.description`,
        priority: sql`excluded.priority`,
        status: sql`excluded.status`,
        submittedDate: sql`excluded.submitted_date`,
        assignedTo: sql`excluded.assigned_to`,
        resolvedDate: sql`excluded.resolved_date`,
        daysOpen: sql`excluded.days_open`,
        clientNotes: sql`excluded.client_notes`,
      },
    });

  console.log(`✓ client_service_requests: ${rows.length} upserted`);
}

async function main() {
  console.log('Seeding Supabase from mock_data.ts ...');
  await seedClients();
  await seedSeats();
  await seedInvoices();
  await seedServiceRequests();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
