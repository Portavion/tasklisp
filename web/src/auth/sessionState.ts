import type { QueryClient } from '@tanstack/vue-query';
import type { SessionResponse } from '../api/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const SESSION_QUERY_KEY = ['session'] as const;

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function getCsrfToken(): string | null {
  return csrfToken;
}

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function loadSession(queryClient: QueryClient): Promise<SessionResponse> {
  const response = await fetch(buildUrl('/api/v1/auth/session'), {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json'
    }
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(`Session bootstrap failed with status ${response.status}`);
  }

  const session = data as SessionResponse;
  queryClient.setQueryData(SESSION_QUERY_KEY, session);
  setCsrfToken(session.csrf_token);

  return session;
}
