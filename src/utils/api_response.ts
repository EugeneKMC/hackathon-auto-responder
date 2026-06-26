// Response envelopes expected by the dashboard frontend.

export type BaseResponse<T> = {
  data: T;
  errors: unknown[];
  message: string;
  success: boolean;
};

export type Paginated<T> = {
  items: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
};

export function baseOk<T>(data: T, message = 'OK'): BaseResponse<T> {
  return { data, errors: [], message, success: true };
}

// Slice an already-sorted, fully-materialized list into a page envelope.
// Datasets here are small (per-client), so in-memory paging is fine.
export function paginate<T>(
  items: T[],
  pageNumber: number,
  pageSize: number,
  message = 'OK'
): BaseResponse<Paginated<T>> {
  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const start = (pageNumber - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return baseOk(
    {
      items: pageItems,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1 && totalCount > 0,
      pageNumber,
      totalCount,
      totalPages,
    },
    message
  );
}

// sort param is "field:direction" (e.g. "createdAt:desc"). We only sort by
// date per resource, so just extract the direction.
export function parseSortDirection(
  sort: string | undefined,
  fallback: 'asc' | 'desc' = 'desc'
): 'asc' | 'desc' {
  const dir = sort?.split(':')[1]?.toLowerCase();
  if (dir === 'asc') return 'asc';
  if (dir === 'desc') return 'desc';
  return fallback;
}
