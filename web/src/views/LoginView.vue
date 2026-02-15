<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { sanitizeNextPath } from '../auth/paths';
import { useAuthProviders, useSession } from '../composables/useSession';

const route = useRoute();
const nextPath = computed(() => sanitizeNextPath(route.query.next));
const sessionQuery = useSession();
const providersQuery = useAuthProviders(nextPath);

const isAuthenticated = computed(() => sessionQuery.data.value?.authenticated === true);
const hasAvailableProvider = computed(() =>
  Boolean(
    providersQuery.data.value?.google_login_url || providersQuery.data.value?.apple_login_url
  )
);
const hasSessionBootstrapError = computed(
  () => route.query.auth_error === 'session_unavailable'
);
</script>

<template>
  <section class="card">
    <header class="panel-header">
      <h1 class="panel-title">Sign in</h1>
    </header>

    <div class="panel-body stack">
      <p class="helper">
        Authenticate with Google or Apple via django-allauth routes.
      </p>

      <p v-if="hasSessionBootstrapError" class="error">
        Could not verify your session. Please sign in again.
      </p>

      <p v-if="isAuthenticated" class="helper">You are already signed in.</p>

      <template v-else>
        <a
          v-if="providersQuery.data.value?.google_login_url"
          class="primary"
          :href="providersQuery.data.value.google_login_url"
        >
          Continue with Google
        </a>

        <a
          v-if="providersQuery.data.value?.apple_login_url"
          class="primary"
          :href="providersQuery.data.value.apple_login_url"
        >
          Continue with Apple
        </a>

        <p
          v-if="!providersQuery.isLoading.value && !providersQuery.isError.value && !hasAvailableProvider"
          class="helper"
        >
          No social providers are currently configured for this environment.
        </p>
      </template>

      <p v-if="providersQuery.isError.value" class="error">
        Could not load auth providers.
      </p>
    </div>
  </section>
</template>
