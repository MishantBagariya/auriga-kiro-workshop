export interface ApiSuccessEnvelope<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ApiErrorCode = 'VALIDATION_ERROR' | 'INVALID_ID' | 'NOT_FOUND' | 'INTERNAL_ERROR';

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  details?: ApiFieldError[];
}

export interface ApiErrorEnvelope {
  error: ApiErrorBody;
}

/**
 * Thrown by apiClient for any non-2xx response, and for network
 * failures with a synthetic NETWORK_ERROR code so the UI can tell a
 * connection problem apart from a server rejection.
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCode | 'NETWORK_ERROR';
  public readonly status?: number;
  public readonly details?: ApiFieldError[];

  constructor(message: string, code: ApiErrorCode | 'NETWORK_ERROR', status?: number, details?: ApiFieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface ListResult<T> {
  data: T[];
  meta: PaginationMeta;
}
