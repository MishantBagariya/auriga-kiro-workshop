export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 50;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function buildPaginationMeta(total: number, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
