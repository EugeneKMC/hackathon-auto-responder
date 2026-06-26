import {
  interpretSearchQuery,
  type SearchCriteria,
} from '@/agents/search_filter_agent';
import type { AiSearchMeta } from '@/types/dashboard';

type ResourceKind = 'invoices' | 'seats' | 'service-requests';

// How to read the filterable fields off a contract item.
export type SearchAccessors<T> = {
  date: (item: T) => string | null; // the resource's sort/filter date
  status: (item: T) => string; // contract status value
  priority?: (item: T) => string; // contract priority value (SR only)
  text: (item: T) => string; // concatenated searchable text
};

// User-typed status synonyms -> canonical contract status.
const STATUS_SYNONYMS: Record<string, string> = {
  unpaid: 'pending',
};

function normStatus(s: string): string {
  const k = s
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return STATUS_SYNONYMS[k] ?? k;
}

function substringFilter<T>(
  items: T[],
  needle: string,
  acc: SearchAccessors<T>
): T[] {
  const n = needle.toLowerCase();
  return items.filter((it) => acc.text(it).toLowerCase().includes(n));
}

function applyCriteria<T>(
  items: T[],
  c: SearchCriteria,
  acc: SearchAccessors<T>
): T[] {
  return items.filter((it) => {
    if (c.status && normStatus(acc.status(it)) !== normStatus(c.status)) {
      return false;
    }
    if (
      c.priority &&
      acc.priority &&
      acc.priority(it).toLowerCase() !== c.priority.toLowerCase()
    ) {
      return false;
    }
    const d = acc.date(it);
    if (c.dateFrom && (!d || d < c.dateFrom)) return false;
    if (c.dateTo && (!d || d > c.dateTo)) return false;
    if (c.text) {
      // Every token must appear (handles multi-word terms like "hardware
      // connectivity" where the words aren't contiguous in the row).
      const hay = acc.text(it).toLowerCase();
      const tokens = c.text.toLowerCase().split(/\s+/).filter(Boolean);
      if (!tokens.every((tok) => hay.includes(tok))) return false;
    }
    return true;
  });
}

// Try to satisfy the query without the LLM. Returns null when the query looks
// like natural language and should be routed to OpenAI.
function tryNative<T>(
  items: T[],
  query: string,
  allowedStatuses: string[],
  allowedPriorities: string[] | undefined,
  acc: SearchAccessors<T>
): T[] | null {
  const s = query.trim().toLowerCase();
  const normalized = normStatus(s);

  if (allowedStatuses.includes(normalized)) {
    return items.filter((it) => normStatus(acc.status(it)) === normalized);
  }
  if (allowedPriorities?.includes(s) && acc.priority) {
    return items.filter((it) => acc.priority!(it).toLowerCase() === s);
  }
  // A single bare token (id / number / name fragment) → substring match.
  if (!s.includes(' ')) return substringFilter(items, s, acc);

  // Multi-word, not a recognized keyword → needs interpretation.
  return null;
}

export async function runSearch<T>(args: {
  items: T[];
  search: string | undefined;
  resource: ResourceKind;
  accessors: SearchAccessors<T>;
  allowedStatuses: string[];
  allowedPriorities?: string[];
  today: string;
}): Promise<{ items: T[]; ai?: AiSearchMeta }> {
  const query = args.search?.trim();
  if (!query) return { items: args.items };

  const native = tryNative(
    args.items,
    query,
    args.allowedStatuses,
    args.allowedPriorities,
    args.accessors
  );
  if (native) return { items: native };

  const interpreted = await interpretSearchQuery({
    resource: args.resource,
    query,
    allowedStatuses: args.allowedStatuses,
    allowedPriorities: args.allowedPriorities,
    today: args.today,
  });

  if (interpreted) {
    return {
      items: applyCriteria(args.items, interpreted.criteria, args.accessors),
      ai: { handledByAi: true, interpretation: interpreted.interpretation },
    };
  }

  // OpenAI unavailable/failed — best-effort substring match, no ai meta.
  return { items: substringFilter(args.items, query, args.accessors) };
}
