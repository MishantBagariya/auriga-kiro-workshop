import type { ApiError, ApiSuccess } from "./api";

// Client-side fetch wrapper. Unwraps the { data } envelope on success and
// throws an ApiClientError (carrying error/details) on failure, so TanStack
// Query hooks and forms can surface consistent messages.

export class ApiClientError extends Error {
  readonly status: number;
  readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

const GENERIC_ERROR = "Something went wrong, please try again";

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isApiError(body: unknown): body is ApiError {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as ApiError).error === "string"
  );
}

function isApiSuccess<T>(body: unknown): body is ApiSuccess<T> {
  return typeof body === "object" && body !== null && "data" in body;
}

/**
 * Perform a fetch to an API route and return the unwrapped `data`.
 * Throws ApiClientError on non-2xx responses or malformed payloads.
 */
export async function apiFetch<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    // Network-level failure (offline, DNS, etc.)
    throw new ApiClientError(GENERIC_ERROR, 0);
  }

  const body = await parseJson(response);

  if (!response.ok) {
    if (isApiError(body)) {
      throw new ApiClientError(body.error, response.status, body.details);
    }
    throw new ApiClientError(GENERIC_ERROR, response.status);
  }

  if (isApiSuccess<T>(body)) {
    return body.data;
  }

  // 2xx but unexpected shape.
  throw new ApiClientError(GENERIC_ERROR, response.status);
}

// Convenience helpers for common verbs.
export const api = {
  get: <T>(url: string) => apiFetch<T>(url),
  post: <T>(url: string, data?: unknown) =>
    apiFetch<T>(url, { method: "POST", body: JSON.stringify(data ?? {}) }),
  put: <T>(url: string, data?: unknown) =>
    apiFetch<T>(url, { method: "PUT", body: JSON.stringify(data ?? {}) }),
  patch: <T>(url: string, data?: unknown) =>
    apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(data ?? {}) }),
  delete: <T>(url: string) => apiFetch<T>(url, { method: "DELETE" }),
};
