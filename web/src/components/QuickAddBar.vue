<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuickAdd } from '../composables/useTasks';
import { useActiveWorkspace } from '../composables/useWorkspace';

const input = ref('');
const quickAddMutation = useQuickAdd();
const { activeWorkspaceId } = useActiveWorkspace();
const canSubmit = computed(() => Boolean(activeWorkspaceId.value && input.value.trim().length > 0));

async function submitQuickAdd() {
  const workspaceId = activeWorkspaceId.value;
  const trimmed = input.value.trim();

  if (!workspaceId || !trimmed) {
    return;
  }

  quickAddMutation.mutate(
    {
      workspace_id: workspaceId,
      input: trimmed
    },
    {
      onSuccess: () => {
        input.value = '';
      }
    }
  );
}
</script>

<template>
  <form class="quick-add" @submit.prevent="submitQuickAdd">
    <input
      v-model="input"
      type="text"
      placeholder="Quick add: title, tomorrow, #tag, p1"
      aria-label="Quick add task"
    />
    <button class="primary" type="submit" :disabled="!canSubmit || quickAddMutation.isPending.value">
      {{ quickAddMutation.isPending.value ? 'Adding...' : 'Add task' }}
    </button>
  </form>
</template>
