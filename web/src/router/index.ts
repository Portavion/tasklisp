import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { sanitizeNextPath } from '../auth/paths';
import { loadSession } from '../auth/sessionState';
import type { SessionResponse } from '../api/types';
import { queryClient } from '../plugins/queryClient';

type RouteSnapshot = Pick<RouteLocationNormalized, 'name' | 'fullPath' | 'query' | 'meta'>;

type SessionLoader = () => Promise<SessionResponse>;

function createLoginRedirect(path: string, includeError = false): NavigationGuardReturn {
  return {
    path: '/login',
    query: includeError
      ? { next: path, auth_error: 'session_unavailable' }
      : { next: path }
  };
}

export async function resolveAuthGuardNavigation(
  to: RouteSnapshot,
  sessionLoader: SessionLoader
): Promise<NavigationGuardReturn> {
  const requiresAuth = to.meta.requiresAuth === true;
  const isLoginRoute = to.name === 'login';

  try {
    const session = await sessionLoader();

    if (requiresAuth && !session.authenticated) {
      return createLoginRedirect(to.fullPath);
    }

    if (isLoginRoute && session.authenticated) {
      return sanitizeNextPath(to.query.next);
    }

    return true;
  } catch {
    if (isLoginRoute) {
      return true;
    }

    if (requiresAuth) {
      return createLoginRedirect(to.fullPath, true);
    }

    return true;
  }
}

export const routes = [
  {
    path: '/',
    redirect: '/inbox'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/inbox',
    name: 'inbox',
    component: () => import('../views/InboxView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/today',
    name: 'today',
    component: () => import('../views/TodayView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/upcoming',
    name: 'upcoming',
    component: () => import('../views/UpcomingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('../views/NotesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/filters',
    name: 'filters',
    component: () => import('../views/FiltersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/conflicts',
    name: 'conflicts',
    component: () => import('../views/ConflictsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/inbox'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) =>
  resolveAuthGuardNavigation(to, () => loadSession(queryClient))
);

export default router;
