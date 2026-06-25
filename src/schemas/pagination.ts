import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
