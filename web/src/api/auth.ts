import { apiFetch, ApiError } from './http';
import type { AuthProvidersResponse, SessionResponse } from './types';

const UNAUTHENTICATED_SESSION: SessionResponse = {
  authenticated: false,
  providers: ['google', 'apple']
};

export async function fetchSession(): Promise<SessionResponse> {
  try {
    return await apiFetch<SessionResponse>('/api/v1/auth/session');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return UNAUTHENTICATED_SESSION;
    }

    throw error;
  }
}

export async function fetchAuthProviders(): Promise<AuthProvidersResponse> {
  return apiFetch<AuthProvidersResponse>('/api/v1/auth/providers');
}

export async function logout(): Promise<void> {
  await apiFetch<void>('/api/v1/auth/logout', { method: 'POST' });
}
