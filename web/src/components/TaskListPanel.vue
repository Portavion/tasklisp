<script setup lang="ts">
import { computed } from 'vue';
import TaskList from './TaskList.vue';
import { useActiveWorkspace } from '../composables/useWorkspace';
import { useTasks } from '../composables/useTasks';
import type { TaskQuery, TaskView } from '../api/types';

const props = withDefaults(
  defineProps<{
    title: string;
    view: TaskView;
    upcomingDays?: number;
    search?: string;
  }>(),
  {
    upcomingDays: 7,
    search: ''
  }
);

const { activeWorkspaceId } = useActiveWorkspace();

function dateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const taskQuery = computed<TaskQuery | null>(() => {
  if (!activeWorkspaceId.value) {
    return null;
  }

  const query: TaskQuery = {
    workspaceId: activeWorkspaceId.value,
    view: props.view,
    limit: 100
  };

  if (props.view === 'upcoming') {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + props.upcomingDays);
    query.from = dateIso(today);
    query.to = dateIso(end);
  }

  if (props.view === 'search' && props.search.trim()) {
    query.q = props.search.trim();
  }

  return query;
});

const tasksQuery = useTasks(taskQuery);
</script>

<template>
  <section class="card">
    <header class="panel-header">
      <h1 class="panel-title">{{ title }}</h1>
    </header>

    <div class="panel-body stack">
      <p v-if="!activeWorkspaceId" class="helper">Create or select a workspace to load tasks.</p>

      <p v-else-if="tasksQuery.isLoading.value" class="helper">Loading tasks...</p>

      <p v-else-if="tasksQuery.isError.value" class="error">
        Could not load tasks. Check auth/session and backend availability.
      </p>

      <TaskList v-else-if="(tasksQuery.data.value?.items.length ?? 0) > 0" :tasks="tasksQuery.data.value?.items ?? []" />

      <p v-else class="helper">No tasks in this view.</p>
    </div>
  </section>
</template>
