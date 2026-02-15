import type { Ref } from 'vue';
import { computed } from 'vue';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { SESSION_QUERY_KEY, setCsrfToken } from '../auth/sessionState';
import { fetchAuthProviders, fetchSession, logout } from '../api/auth';

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const session = await fetchSession();
      setCsrfToken(session.csrf_token);
      return session;
    },
    staleTime: 60_000,
    retry: false
  });
}

export function useAuthProviders(nextPath?: Ref<string | undefined>) {
  return useQuery({
    queryKey: computed(() => ['auth-providers', nextPath?.value ?? null]),
    queryFn: () => fetchAuthProviders(nextPath?.value),
    staleTime: 60_000
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setCsrfToken(null);
      queryClient.setQueryData(SESSION_QUERY_KEY, {
        authenticated: false,
        providers: [],
        csrf_token: ''
      });

      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
    }
  });
}
