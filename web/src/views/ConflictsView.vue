<script setup lang="ts">
import { useActiveWorkspace } from '../composables/useWorkspace';
import { useConflicts } from '../composables/useConflicts';

const { activeWorkspaceId } = useActiveWorkspace();
const conflictsQuery = useConflicts(activeWorkspaceId);
</script>

<template>
  <section class="card">
    <header class="panel-header">
      <h1 class="panel-title">Conflicts</h1>
    </header>

    <div class="panel-body stack">
      <p v-if="!activeWorkspaceId" class="helper">Select a workspace to review conflicts.</p>

      <p v-else-if="conflictsQuery.isLoading.value" class="helper">Loading conflicts...</p>

      <p v-else-if="conflictsQuery.isError.value" class="error">
        Could not load conflicts.
      </p>

      <p v-else-if="(conflictsQuery.data.value?.length ?? 0) === 0" class="helper">
        No open conflicts.
      </p>

      <ul v-else class="task-list">
        <li v-for="item in conflictsQuery.data.value" :key="item.id" class="task-item">
          <div class="task-main">
            <p class="task-title">Node {{ item.node_id }}</p>
            <span class="badge conflict">{{ item.status }}</span>
          </div>
          <div class="task-meta">
            <span>Fields: {{ item.conflicting_fields.join(', ') }}</span>
            <span>Detected: {{ item.detected_at }}</span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
