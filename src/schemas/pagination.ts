import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
  // Free-text query; sent only when the user types something. May be natural
  // language, in which case it is interpreted by OpenAI (see search_filter).
  search: z.string().trim().min(1).optional(),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
