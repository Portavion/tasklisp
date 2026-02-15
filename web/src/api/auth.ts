import { apiFetch } from './http';
import type { AuthProvidersResponse, SessionResponse } from './types';

export async function fetchSession(): Promise<SessionResponse> {
  return apiFetch<SessionResponse>('/api/v1/auth/session');
}

export async function fetchAuthProviders(nextPath?: string): Promise<AuthProvidersResponse> {
  if (nextPath) {
    const params = new URLSearchParams({ next: nextPath });
    return apiFetch<AuthProvidersResponse>(`/api/v1/auth/providers?${params.toString()}`);
  }

  return apiFetch<AuthProvidersResponse>('/api/v1/auth/providers');
}

export async function logout(): Promise<void> {
  await apiFetch<void>('/api/v1/auth/logout', { method: 'POST' });
}
