<script setup lang="ts">
import type { Task } from '../api/types';

defineProps<{ tasks: Task[] }>();
</script>

<template>
  <ul class="task-list">
    <li v-for="task in tasks" :key="task.node_id" class="task-item">
      <div class="task-main">
        <p class="task-title">{{ task.title }}</p>
        <span v-if="task.priority" class="badge">P{{ task.priority }}</span>
      </div>
      <div class="task-meta">
        <span v-if="task.todo_state" class="badge">{{ task.todo_state }}</span>
        <span v-if="task.deadline_raw">Deadline {{ task.deadline_raw }}</span>
        <span v-if="task.scheduled_raw">Scheduled {{ task.scheduled_raw }}</span>
        <span v-for="tag in task.tags" :key="tag" class="badge">#{{ tag }}</span>
      </div>
    </li>
  </ul>
</template>
