import { NextResponse } from "next/server";
import { z } from "zod";

// Consistent API response helpers for route handlers.
//
// Success shape: { data, message? }
// Error shape:   { error, details? }

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export function success<T>(
  data: T,
  init?: { status?: number; message?: string },
): NextResponse<ApiSuccess<T>> {
  const body: ApiSuccess<T> = { data };
  if (init?.message) body.message = init.message;
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

export function created<T>(
  data: T,
  message?: string,
): NextResponse<ApiSuccess<T>> {
  return success(data, { status: 201, message });
}

export function error(
  message: string,
  init?: { status?: number; details?: Record<string, string[]> },
): NextResponse<ApiError> {
  const body: ApiError = { error: message };
  if (init?.details) body.details = init.details;
  return NextResponse.json(body, { status: init?.status ?? 500 });
}

export function notFound(message = "Resource not found"): NextResponse<ApiError> {
  return error(message, { status: 404 });
}

// Turn a ZodError into a 400 response with field-level messages.
export function validationError(zodError: z.ZodError): NextResponse<ApiError> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of zodError.issues) {
    const key = issue.path.join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return error("Validation failed", {
    status: 400,
    details: fieldErrors,
  });
}

// Wrap a route handler body: parse+validate, run it, and convert thrown
// errors into consistent responses. Logs unexpected errors server-side.
export function handleUnexpected(err: unknown): NextResponse<ApiError> {
  console.error("[api] Unexpected error:", err);
  return error("Something went wrong, please try again", { status: 500 });
}

// UUID guard for path params.
export function isUuid(value: string): boolean {
  return z.uuid().safeParse(value).success;
}
