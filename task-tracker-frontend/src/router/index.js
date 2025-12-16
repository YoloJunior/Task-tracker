// Маршрутизація Vue Router

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Маршрути додатку
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }  // тільки для гостей
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guest: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/ProjectsView.vue'),
    meta: { requiresAuth: true }  // потрібна авторизація
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('../views/ProjectDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/TasksView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/statuses',
    name: 'Statuses',
    component: () => import('../views/StatusesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('../views/TagsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: '/projects'  // головна -> проекти
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Перевірка доступу перед переходом
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')  // не авторизований -> логін
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/projects')  // авторизований гість -> проекти
  } else {
    next()
  }
})

export default router
