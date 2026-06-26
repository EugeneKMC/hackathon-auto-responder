import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { getOpenAI } from '@/config/openai';
import { env } from '@/utils/env';

export type SearchCriteria = {
  status: string | null;
  priority: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  text: string | null;
};

// Models sometimes emit the literal string "null"/"undefined" or whitespace
// instead of JSON null. Coerce all of those to real null.
function nn(v: string | null | undefined): string | null {
  if (v == null) return null;
  const s = v.trim();
  if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') {
    return null;
  }
  return s;
}

// Only honor a date range when the query actually references time. Prevents the
// model from silently defaulting to the current month/year.
const TEMPORAL =
  /\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t|tember)?|oct(ober)?|nov(ember)?|dec(ember)?|month|months|week|weeks|year|years|quarter|q[1-4]|last|this|past|recent|between|since|before|after|day|days|today|yesterday|\d{4}|\d{1,2}[/-]\d)/i;

// Drop filler words the model leaks into the free-text term ("my", "tickets"…).
const STOPWORDS = new Set([
  'my',
  'me',
  'mine',
  'our',
  'your',
  'the',
  'a',
  'an',
  'all',
  'show',
  'get',
  'find',
  'list',
  'give',
  'please',
  'want',
  'need',
  'see',
  'tickets',
  'ticket',
  'invoice',
  'invoices',
  'seat',
  'seats',
  'request',
  'requests',
  'on',
  'in',
  'of',
  'for',
  'and',
  'or',
  'with',
  'to',
  'from',
  'that',
  'are',
  'is',
  'whats',
  'issue',
  'issues',
  'problem',
  'problems',
  'concern',
  'concerns',
  'question',
  'questions',
]);

function buildInterpretation(resource: string, c: SearchCriteria): string {
  const noun =
    resource === 'invoices'
      ? 'invoices'
      : resource === 'seats'
        ? 'seats'
        : 'service requests';
  const lead = [
    c.status?.replace(/_/g, ' '),
    c.priority && `${c.priority} priority`,
  ]
    .filter(Boolean)
    .join(' ');
  let s = `${lead ? lead + ' ' : ''}${noun}`;
  if (c.text) s += ` matching "${c.text}"`;
  if (c.dateFrom && c.dateTo) s += ` (${c.dateFrom} → ${c.dateTo})`;
  else if (c.dateFrom) s += ` (from ${c.dateFrom})`;
  else if (c.dateTo) s += ` (until ${c.dateTo})`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function cleanText(v: string | null | undefined): string | null {
  const s = nn(v);
  if (!s) return null;
  const kept = s
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w));
  return kept.length ? kept.join(' ') : null;
}

export async function interpretSearchQuery(args: {
  resource: 'invoices' | 'seats' | 'service-requests';
  query: string;
  allowedStatuses: string[];
  allowedPriorities?: string[];
  today: string;
}): Promise<{ criteria: SearchCriteria; interpretation: string } | null> {
  if (!env.OPENAI_API_KEY) return null;

  try {
    const client = getOpenAI();

    // Build the filter schema from the resource's real columns so the model can
    // only choose valid enum values (or null) — never invent one.
    const statusField = z
      .enum(args.allowedStatuses as [string, ...string[]])
      .nullable();
    const priorityField = args.allowedPriorities
      ? z.enum(args.allowedPriorities as [string, ...string[]]).nullable()
      : z.null();

    const FilterSchema = z.object({
      status: statusField,
      priority: priorityField,
      date_from: z.string().nullable(), // ISO YYYY-MM-DD, only if explicit
      date_to: z.string().nullable(),
      text: z.string().nullable(),
      interpretation: z.string(),
    });

    const priorityLine = args.allowedPriorities
      ? `\n- priority: exactly one of [${args.allowedPriorities.join(', ')}] or null.`
      : '';

    const completion = await client.beta.chat.completions.parse({
      model: env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            `You convert a user's search query into a structured filter for ${args.resource}.\n` +
            `Today is ${args.today}. Use it ONLY to resolve dates the user explicitly states.\n\n` +
            `Set every field to null UNLESS the query explicitly implies it. Rules:\n` +
            `- status: exactly one of [${args.allowedStatuses.join(', ')}] or null. ` +
            `e.g. "open tickets" -> status "open"; "overdue invoices" -> status "overdue".${priorityLine}\n` +
            `- date_from / date_to: set ONLY when the query mentions a specific date, month, quarter, or relative period ("in May", "last two months"). ` +
            `If the query mentions NO time period, BOTH MUST be null. NEVER assume the current month or year.\n` +
            `- text: a leftover keyword (id, number, name) or null.\n` +
            `- interpretation: a short summary of the filter you actually applied.\n\n` +
            `Examples:\n` +
            `"my open tickets" -> status="open", date_from=null, date_to=null, text=null, interpretation="Open tickets"\n` +
            `"tickets in May" -> status=null, date_from="2026-05-01", date_to="2026-05-31", interpretation="Tickets from May 2026"`,
        },
        { role: 'user', content: args.query },
      ],
      response_format: zodResponseFormat(FilterSchema, 'filter'),
    });

    const parsed = completion.choices[0]?.message.parsed;
    if (!parsed) return null;

    // Guard the model's output: only keep a date range when the query actually
    // references time, and scrub "null"/stop-word noise.
    const hasTemporal = TEMPORAL.test(args.query);

    const criteria: SearchCriteria = {
      status: nn(parsed.status),
      priority: nn(parsed.priority as string | null),
      dateFrom: hasTemporal ? nn(parsed.date_from) : null,
      dateTo: hasTemporal ? nn(parsed.date_to) : null,
      text: cleanText(parsed.text),
    };

    // Describe the filter we actually applied (not the model's prose, which can
    // mention a date we dropped).
    return {
      criteria,
      interpretation: buildInterpretation(args.resource, criteria),
    };
  } catch {
    return null;
  }
}
