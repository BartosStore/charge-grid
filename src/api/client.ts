import { store } from '../store/store';
import { loggedOut } from '../store/authSlice';
import { API_URL } from './config';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
}

export async function apiFetch<T>(path: string, { method = 'GET', body, query }: RequestOptions = {}): Promise<T> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value));
  }
  const search = params.size ? `?${params}` : '';
  const token = store.getState().auth.token;

  const response = await fetch(`${API_URL}${path}${search}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && token) store.dispatch(loggedOut());
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(response.status, payload.message ?? response.statusText);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
