import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { fetchConflicts } from '../api/conflicts';

export function useConflicts(workspaceIdRef: Ref<string | null>) {
  return useQuery({
    queryKey: computed(() => ['conflicts', workspaceIdRef.value]),
    queryFn: () => fetchConflicts(workspaceIdRef.value as string),
    enabled: computed(() => Boolean(workspaceIdRef.value))
  });
}
