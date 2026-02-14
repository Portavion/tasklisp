import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { fetchAuthProviders, fetchSession, logout } from '../api/auth';

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: 60_000,
    retry: false
  });
}

export function useAuthProviders() {
  return useQuery({
    queryKey: ['auth-providers'],
    queryFn: fetchAuthProviders,
    staleTime: 60_000
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['session'], {
        authenticated: false,
        providers: ['google', 'apple']
      });

      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
    }
  });
}
