<script setup lang="ts">
import TaskListPanel from '../components/TaskListPanel.vue';
</script>

<template>
  <TaskListPanel title="Upcoming (7 days)" view="upcoming" :upcoming-days="7" />
</template>
