import { describe, expect, it } from 'vitest';
import type { SessionResponse } from '../api/types';
import { resolveAuthGuardNavigation } from './index';

function makeRoute(params: {
  name: string;
  fullPath: string;
  requiresAuth: boolean;
  next?: string;
}) {
  return {
    name: params.name,
    fullPath: params.fullPath,
    query: params.next ? { next: params.next } : {},
    meta: { requiresAuth: params.requiresAuth }
  };
}

const unauthenticatedSession: SessionResponse = {
  authenticated: false,
  providers: [],
  csrf_token: ''
};

const authenticatedSession: SessionResponse = {
  authenticated: true,
  providers: ['google'],
  csrf_token: 'csrf-token',
  user: {
    id: '1',
    email: 'user@example.com',
    name: 'User'
  }
};

describe('resolveAuthGuardNavigation', () => {
  it('redirects unauthenticated users from protected routes to login with next', async () => {
    const result = await resolveAuthGuardNavigation(
      makeRoute({ name: 'today', fullPath: '/today', requiresAuth: true }),
      async () => unauthenticatedSession
    );

    expect(result).toEqual({
      path: '/login',
      query: { next: '/today' }
    });
  });

  it('redirects authenticated login route to next path', async () => {
    const result = await resolveAuthGuardNavigation(
      makeRoute({
        name: 'login',
        fullPath: '/login?next=/conflicts',
        requiresAuth: false,
        next: '/conflicts'
      }),
      async () => authenticatedSession
    );

    expect(result).toBe('/conflicts');
  });

  it('redirects protected routes to login with auth_error when session bootstrap fails', async () => {
    const result = await resolveAuthGuardNavigation(
      makeRoute({ name: 'inbox', fullPath: '/inbox', requiresAuth: true }),
      async () => {
        throw new Error('network down');
      }
    );

    expect(result).toEqual({
      path: '/login',
      query: { next: '/inbox', auth_error: 'session_unavailable' }
    });
  });

  it('allows public login route when session bootstrap fails', async () => {
    const result = await resolveAuthGuardNavigation(
      makeRoute({ name: 'login', fullPath: '/login', requiresAuth: false }),
      async () => {
        throw new Error('network down');
      }
    );

    expect(result).toBe(true);
  });
});
