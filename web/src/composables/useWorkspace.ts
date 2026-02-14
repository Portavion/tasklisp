import { computed, ref, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { fetchWorkspaces } from '../api/workspaces';

const WORKSPACE_STORAGE_KEY = 'org-tasks-active-workspace-id';
const selectedWorkspaceId = ref<string | null>(localStorage.getItem(WORKSPACE_STORAGE_KEY));

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
    staleTime: 30_000
  });
}

export function useActiveWorkspace() {
  const workspacesQuery = useWorkspaces();

  watch(
    () => workspacesQuery.data.value,
    (workspaces) => {
      if (!workspaces || workspaces.length === 0) {
        selectedWorkspaceId.value = null;
        localStorage.removeItem(WORKSPACE_STORAGE_KEY);
        return;
      }

      const exists = workspaces.some((workspace) => workspace.id === selectedWorkspaceId.value);

      if (!exists) {
        selectedWorkspaceId.value = workspaces[0].id;
      }
    },
    { immediate: true }
  );

  watch(selectedWorkspaceId, (nextValue) => {
    if (nextValue) {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, nextValue);
    }
  });

  const activeWorkspace = computed(() => {
    const workspaces = workspacesQuery.data.value ?? [];
    return workspaces.find((workspace) => workspace.id === selectedWorkspaceId.value) ?? null;
  });

  function setActiveWorkspaceId(workspaceId: string) {
    selectedWorkspaceId.value = workspaceId;
  }

  return {
    workspacesQuery,
    activeWorkspaceId: selectedWorkspaceId,
    activeWorkspace,
    setActiveWorkspaceId
  };
}
