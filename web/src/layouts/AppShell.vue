<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import QuickAddBar from '../components/QuickAddBar.vue';
import { useActiveWorkspace } from '../composables/useWorkspace';
import { useLogout, useSession } from '../composables/useSession';

const navItems = [
  { to: '/inbox', label: 'Inbox' },
  { to: '/today', label: 'Today' },
  { to: '/upcoming', label: 'Upcoming' },
  { to: '/notes', label: 'Notes' },
  { to: '/filters', label: 'Filters' },
  { to: '/conflicts', label: 'Conflicts' },
  { to: '/settings', label: 'Settings' }
];

const sessionQuery = useSession();
const logoutMutation = useLogout();
const { workspacesQuery, activeWorkspaceId, setActiveWorkspaceId } = useActiveWorkspace();

const isAuthenticated = computed(() => sessionQuery.data.value?.authenticated === true);
const userName = computed(() => sessionQuery.data.value?.user?.name ?? 'Not signed in');

function onWorkspaceChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (value) {
    setActiveWorkspaceId(value);
  }
}

function onLogout() {
  logoutMutation.mutate();
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">Org Tasks</div>

      <nav class="nav-links" aria-label="Primary navigation">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <RouterLink v-if="!isAuthenticated" class="nav-link" to="/login">Sign in</RouterLink>
    </aside>

    <div class="shell-main">
      <header class="topbar">
        <label>
          <span class="helper">Workspace</span>
          <select :value="activeWorkspaceId ?? ''" @change="onWorkspaceChange">
            <option disabled value="">Select workspace</option>
            <option
              v-for="workspace in workspacesQuery.data.value ?? []"
              :key="workspace.id"
              :value="workspace.id"
            >
              {{ workspace.name }}
            </option>
          </select>
        </label>

        <div class="status">
          {{ sessionQuery.isLoading.value ? 'Checking session...' : userName }}
        </div>

        <button
          v-if="isAuthenticated"
          class="ghost"
          type="button"
          @click="onLogout"
          :disabled="logoutMutation.isPending.value"
        >
          {{ logoutMutation.isPending.value ? 'Signing out...' : 'Sign out' }}
        </button>
      </header>

      <QuickAddBar v-if="isAuthenticated" />

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
