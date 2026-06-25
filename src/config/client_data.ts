import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

// Ported from the 3am-client-assistant Express server (dataStore.js).
// Loads the hackathon client dataset CSVs (Clients / Seats / Invoices /
// Service Requests) that power the client chat assistant.

// Maps the row-4 CSV headers to normalized camelCase keys.
const KEY_MAP: Record<string, string> = {
  'Client Id': 'clientId',
  'Company Name': 'companyName',
  'Primary Contact': 'primaryContact',
  Email: 'email',
  Phone: 'phone',
  'Preferred Channel': 'preferredChannel',
  'Account Manager': 'accountManager',
  'Client Since': 'clientSince',
  'Contract Type': 'contractType',
  Status: 'status',
  'Seat Record Id': 'seatRecordId',
  'Total Seats': 'totalSeats',
  'Seats Occupied': 'seatsOccupied',
  'Seats Available': 'seatsAvailable',
  'Occupancy Pct': 'occupancyPct',
  'Floor Zone': 'floorZone',
  'Daily Rate Php': 'dailyRatePhp',
  'Contract Start': 'contractStart',
  'Contract End': 'contractEnd',
  'Next Review Date': 'nextReviewDate',
  Notes: 'notes',
  'Invoice Id': 'invoiceId',
  'Invoice Number': 'invoiceNumber',
  'Issue Date': 'issueDate',
  'Due Date': 'dueDate',
  'Amount Php': 'amountPhp',
  'Paid Date': 'paidDate',
  'Days Overdue': 'daysOverdue',
  'Billing Period': 'billingPeriod',
  Description: 'description',
  'Ticket Id': 'ticketId',
  'Request Type': 'requestType',
  Priority: 'priority',
  'Submitted Date': 'submittedDate',
  'Assigned To': 'assignedTo',
  'Resolved Date': 'resolvedDate',
  'Days Open': 'daysOpen',
  'Client Notes': 'clientNotes',
};

const NUMERIC_KEYS = new Set([
  'totalSeats',
  'seatsOccupied',
  'seatsAvailable',
  'dailyRatePhp',
  'amountPhp',
  'daysOverdue',
  'daysOpen',
]);

export type Row = Record<string, string | number>;

export type ClientData = {
  clients: Row[];
  seats: Row[];
  invoices: Row[];
  serviceRequests: Row[];
};

function toNumber(value: unknown): number {
  const n = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

function findFile(dataDir: string, substring: string): string {
  const match = fs
    .readdirSync(dataDir)
    .find((f) => f.includes(substring) && f.toLowerCase().endsWith('.csv'));
  if (!match) throw new Error(`CSV not found for "${substring}" in ${dataDir}`);
  return path.join(dataDir, match);
}

function loadTable(dataDir: string, substring: string): Row[] {
  const file = findFile(dataDir, substring);
  const content = fs.readFileSync(file, 'utf8');
  const rows = parse(content, {
    columns: true,
    from_line: 4,
    bom: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, string>[];
  return rows.map((row) => {
    const out: Row = {};
    for (const [header, value] of Object.entries(row)) {
      const key = KEY_MAP[header] ?? header;
      out[key] = NUMERIC_KEYS.has(key) ? toNumber(value) : value;
    }
    return out;
  });
}

// Default to the repo-level data/ directory (overridable via DATA_DIR).
const DEFAULT_DATA_DIR = path.resolve(import.meta.dir, '..', '..', 'data');

let cache: ClientData | null = null;

export function loadClientData(
  dataDir: string = Bun.env.DATA_DIR || DEFAULT_DATA_DIR
): ClientData {
  if (cache) return cache;
  const resolved = path.resolve(dataDir);
  cache = {
    clients: loadTable(resolved, '(Clients)'),
    seats: loadTable(resolved, '(Seats)'),
    invoices: loadTable(resolved, '(Invoices)'),
    serviceRequests: loadTable(resolved, '(Service Requests)'),
  };
  return cache;
}
