import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/inbox'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/inbox',
      name: 'inbox',
      component: () => import('../views/InboxView.vue')
    },
    {
      path: '/today',
      name: 'today',
      component: () => import('../views/TodayView.vue')
    },
    {
      path: '/upcoming',
      name: 'upcoming',
      component: () => import('../views/UpcomingView.vue')
    },
    {
      path: '/notes',
      name: 'notes',
      component: () => import('../views/NotesView.vue')
    },
    {
      path: '/filters',
      name: 'filters',
      component: () => import('../views/FiltersView.vue')
    },
    {
      path: '/conflicts',
      name: 'conflicts',
      component: () => import('../views/ConflictsView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/inbox'
    }
  ]
});

export default router;
