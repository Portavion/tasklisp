<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TaskListPanel from '../components/TaskListPanel.vue';

const route = useRoute();
const router = useRouter();
const queryText = ref(typeof route.query.q === 'string' ? route.query.q : '');

watch(
  () => route.query.q,
  (next) => {
    queryText.value = typeof next === 'string' ? next : '';
  }
);

const normalizedSearch = computed(() => queryText.value.trim());

function submitSearch() {
  router.replace({ path: '/notes', query: normalizedSearch.value ? { q: normalizedSearch.value } : {} });
}
</script>

<template>
  <section class="stack">
    <section class="card">
      <header class="panel-header">
        <h1 class="panel-title">Notes and Search</h1>
      </header>
      <div class="panel-body">
        <form class="stack" @submit.prevent="submitSearch">
          <input
            v-model="queryText"
            type="text"
            placeholder="Search title/body/tags"
            aria-label="Search notes"
          />
          <button class="primary" type="submit">Search</button>
        </form>
      </div>
    </section>

    <TaskListPanel title="Search Results" view="search" :search="normalizedSearch" />
  </section>
</template>
