import { ApiError, type ApiErrorEnvelope, type ApiSuccessEnvelope } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * The single HTTP boundary. Applies the base URL, unwraps the success
 * envelope, and throws a typed ApiError for anything else, including
 * a network failure with no response (see architecture.md).
 */
async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; params?: Record<string, string | number | undefined> } = {},
): Promise<ApiSuccessEnvelope<T>> {
  const { method = 'GET', body, params } = options;
  const url = buildUrl(path, params);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 'NETWORK_ERROR');
  }

  if (response.status === 204) {
    return { data: undefined as T };
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = (json as ApiErrorEnvelope | null)?.error;
    throw new ApiError(
      errorBody?.message ?? 'Something went wrong. Please try again.',
      errorBody?.code ?? 'INTERNAL_ERROR',
      response.status,
      errorBody?.details,
    );
  }

  return json as ApiSuccessEnvelope<T>;
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    request<T>(path, { method: 'GET', params }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
