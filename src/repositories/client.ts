import { db } from '@/config/database/db';
import { clients, type Client } from '@/models/clients';

const GENERIC_DOMAINS = new Set([
  'gmail.com',
  'outlook.com',
  'yahoo.com',
  'hotmail.com',
  'icloud.com',
  'kmc.solutions',
]);

function norm(v: string | null | undefined): string {
  return (v ?? '').trim().toLowerCase();
}

let cache: Client[] | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 60_000;

async function loadAll(): Promise<Client[]> {
  if (cache && Date.now() - cacheLoadedAt < CACHE_TTL_MS) return cache;
  cache = await db.select().from(clients);
  cacheLoadedAt = Date.now();
  return cache;
}

export async function findClient(args: {
  company?: string | null;
  email?: string | null;
  client_id?: string | null;
  primary_contact?: string | null;
}): Promise<Client | null> {
  const all = await loadAll();

  const id = norm(args.client_id);
  if (id) {
    return all.find((c) => norm(c.clientId) === id) ?? null;
  }

  const company = norm(args.company);
  if (company) {
    const exact = all.find((c) => norm(c.companyName) === company);
    if (exact) return exact;
    const partial = all.find((c) => norm(c.companyName).includes(company));
    if (partial) return partial;
  }

  const contact = norm(args.primary_contact);
  if (contact) {
    const exact = all.find((c) => norm(c.primaryContact) === contact);
    if (exact) return exact;
    const parts = contact.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const partial = all.find((c) => {
        const pc = norm(c.primaryContact);
        return parts.every((p) => pc.includes(p));
      });
      if (partial) return partial;
    }
  }

  const email = norm(args.email);
  if (email) {
    const direct = all.find((c) => norm(c.email) === email);
    if (direct) return direct;
    const domain = email.split('@')[1];
    if (domain && !GENERIC_DOMAINS.has(domain)) {
      const root = domain.split('.')[0];
      const byDomain = all.find((c) =>
        norm(c.companyName).replace(/\s+/g, '').includes(root)
      );
      if (byDomain) return byDomain;
    }
  }

  return null;
}
