import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { getOpenAI } from '@/config/openai';
import { env } from '@/utils/env';

// Structured filter the LLM extracts from a natural-language search query.
const AiFilterSchema = z.object({
  status: z.string().nullable(),
  priority: z.string().nullable(),
  date_from: z.string().nullable(), // ISO YYYY-MM-DD
  date_to: z.string().nullable(), // ISO YYYY-MM-DD
  text: z.string().nullable(), // free-text keyword to substring-match
  interpretation: z.string(), // short human-readable summary of the filter
});

export type SearchCriteria = {
  status: string | null;
  priority: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  text: string | null;
};

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
    const priorityLine = args.allowedPriorities
      ? ` Allowed priority values: ${args.allowedPriorities.join(', ')}.`
      : '';

    const completion = await client.beta.chat.completions.parse({
      model: env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            `You convert a natural-language search into a structured filter for ${args.resource}. ` +
            `Today is ${args.today}. ` +
            `Allowed status values: ${args.allowedStatuses.join(', ')}.${priorityLine} ` +
            `Resolve relative/partial dates (e.g. "March to June", "last month") to ISO YYYY-MM-DD ranges using today's date. ` +
            `Set a field to null when the query does not imply it. Put any leftover keyword (an id, name, etc.) in "text". ` +
            `Keep "interpretation" short, e.g. "Pending invoices issued Mar–Jun 2026".`,
        },
        { role: 'user', content: args.query },
      ],
      response_format: zodResponseFormat(AiFilterSchema, 'filter'),
    });

    const parsed = completion.choices[0]?.message.parsed;
    if (!parsed) return null;

    return {
      criteria: {
        status: parsed.status,
        priority: parsed.priority,
        dateFrom: parsed.date_from,
        dateTo: parsed.date_to,
        text: parsed.text,
      },
      interpretation: parsed.interpretation,
    };
  } catch {
    // No key, rate limit, parse failure, etc. — caller falls back to native.
    return null;
  }
}
