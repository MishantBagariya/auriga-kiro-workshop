export type ErrorCode = 'VALIDATION_ERROR' | 'INVALID_ID' | 'NOT_FOUND' | 'INTERNAL_ERROR';

export interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * Thrown by services and middleware for any expected, domain-level failure.
 * Caught by errorHandler and translated into the standard error envelope
 * described in .kiro/steering/api-standards.md.
 */
export class AppError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: ErrorDetail[];

  constructor(status: number, code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static notFound(message: string): AppError {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static invalidId(message = 'The provided id is not valid'): AppError {
    return new AppError(400, 'INVALID_ID', message);
  }

  static validation(message: string, details?: ErrorDetail[]): AppError {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }
}
