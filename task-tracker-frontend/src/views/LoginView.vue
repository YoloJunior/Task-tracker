<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <div class="card max-w-md w-full">
      <h2 class="text-3xl font-bold text-center mb-2 text-orange-500">Task Tracker</h2>
      <p class="text-center text-gray-400 mb-6">Login to your account</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="label">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="input-field"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label class="label">Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="btn-primary w-full"
        >
          {{ authStore.loading ? 'Logging in...' : 'Login' }}
        </button>

        <p class="text-center text-gray-400 text-sm mt-4">
          Don't have an account?
          <router-link to="/register" class="text-orange-500 hover:text-orange-400">
            Register here
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
// Сторінка входу

import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

// Обробка входу
const handleLogin = async () => {
  try {
    await authStore.login(form)
    router.push('/projects')
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>
