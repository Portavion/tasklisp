import { computed, type Ref } from 'vue';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { fetchTasks, quickAddTask } from '../api/tasks';
import type { QuickAddInput, TaskQuery } from '../api/types';

export function useTasks(queryRef: Ref<TaskQuery | null>) {
  return useQuery({
    queryKey: computed(() => ['tasks', queryRef.value]),
    queryFn: () => fetchTasks(queryRef.value as TaskQuery),
    enabled: computed(() => Boolean(queryRef.value))
  });
}

export function useQuickAdd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: QuickAddInput) => quickAddTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
    }
  });
}
