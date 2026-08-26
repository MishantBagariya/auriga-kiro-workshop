export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
