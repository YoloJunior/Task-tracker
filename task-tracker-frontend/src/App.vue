<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// Головний компонент додатку

import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Завантажуємо користувача якщо є токен
  if (authStore.isAuthenticated) {
    authStore.fetchUser()
  }
})
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
