<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
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

const mobileNavItems = [
  { to: '/inbox', label: 'Inbox' },
  { to: '/today', label: 'Today' },
  { to: '/upcoming', label: 'Upcoming' },
  { to: '/notes', label: 'Notes' }
];

const sessionQuery = useSession();
const logoutMutation = useLogout();
const { workspacesQuery, activeWorkspaceId, setActiveWorkspaceId } = useActiveWorkspace();
const route = useRoute();
const isNavOpen = ref(false);

const isAuthenticated = computed(() => sessionQuery.data.value?.authenticated === true);
const userName = computed(() => sessionQuery.data.value?.user?.name ?? 'Not signed in');

watch(
  () => route.fullPath,
  () => {
    isNavOpen.value = false;
  }
);

function onWorkspaceChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (value) {
    setActiveWorkspaceId(value);
  }
}

function toggleNav() {
  isNavOpen.value = !isNavOpen.value;
}

function closeNav() {
  isNavOpen.value = false;
}

function onLogout() {
  logoutMutation.mutate();
}
</script>

<template>
  <div class="app-shell">
    <aside id="primary-nav" class="sidebar" :class="{ 'sidebar-open': isNavOpen }">
      <div class="sidebar-header">
        <div class="brand">Org Tasks</div>
        <button class="ghost sidebar-close" type="button" @click="closeNav">Close</button>
      </div>

      <nav class="nav-links" aria-label="Primary navigation">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          @click="closeNav"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <RouterLink v-if="!isAuthenticated" class="nav-link" to="/login" @click="closeNav">Sign in</RouterLink>
    </aside>
    <button
      class="sidebar-backdrop"
      :class="{ visible: isNavOpen }"
      type="button"
      aria-label="Close navigation"
      @click="closeNav"
    />

    <div class="shell-main">
      <header class="topbar">
        <div class="topbar-primary">
          <button
            class="ghost nav-toggle"
            type="button"
            aria-controls="primary-nav"
            :aria-expanded="String(isNavOpen)"
            @click="toggleNav"
          >
            Menu
          </button>

          <label class="workspace-field">
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
        </div>

        <div class="topbar-meta">
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
        </div>
      </header>

      <QuickAddBar v-if="isAuthenticated" />

      <main class="main-content">
        <RouterView />
      </main>

      <nav class="mobile-tabbar" aria-label="Quick navigation">
        <RouterLink
          v-for="item in mobileNavItems"
          :key="item.to"
          :to="item.to"
          class="mobile-tab"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
  </div>
</template>
