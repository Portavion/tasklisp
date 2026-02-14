<script setup lang="ts">
import { computed } from 'vue';
import { useAuthProviders, useSession } from '../composables/useSession';

const sessionQuery = useSession();
const providersQuery = useAuthProviders();

const isAuthenticated = computed(() => sessionQuery.data.value?.authenticated === true);
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
      </template>

      <p v-if="providersQuery.isError.value" class="error">
        Could not load auth providers.
      </p>
    </div>
  </section>
</template>
