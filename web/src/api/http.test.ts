import { afterEach, describe, expect, it, vi } from 'vitest';
import { setCsrfToken } from '../auth/sessionState';
import { apiFetch } from './http';

function mockJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json'
    }
  });
}

describe('apiFetch csrf behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setCsrfToken(null);
  });

  it('adds X-CSRFToken for mutating requests', async () => {
    setCsrfToken('session-token');
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockJsonResponse({ ok: true }));

    await apiFetch('/api/v1/tasks/quick-add', {
      method: 'POST',
      body: JSON.stringify({ input: 'todo' })
    });

    const requestInit = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = new Headers(requestInit.headers);
    expect(headers.get('X-CSRFToken')).toBe('session-token');
  });

  it('does not add X-CSRFToken for non-mutating requests', async () => {
    setCsrfToken('session-token');
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockJsonResponse({ authenticated: false }));

    await apiFetch('/api/v1/auth/session', { method: 'GET' });

    const requestInit = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = new Headers(requestInit.headers);
    expect(headers.has('X-CSRFToken')).toBe(false);
  });

  it('respects explicit X-CSRFToken headers', async () => {
    setCsrfToken('session-token');
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockJsonResponse({ ok: true }));

    await apiFetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'X-CSRFToken': 'manual-token'
      }
    });

    const requestInit = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = new Headers(requestInit.headers);
    expect(headers.get('X-CSRFToken')).toBe('manual-token');
  });
});
