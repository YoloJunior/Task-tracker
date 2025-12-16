<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-8">
    <div class="card max-w-md w-full">
      <h2 class="text-3xl font-bold text-center mb-2 text-orange-500">Task Tracker</h2>
      <p class="text-center text-gray-400 mb-6">Create your account</p>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="label">Name</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="input-field"
            placeholder="Your Name"
          />
        </div>

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
          <label class="label">Password (min 6 characters)</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label class="label">Role</label>
          <select v-model="form.role" class="input-field">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="btn-primary w-full"
        >
          {{ authStore.loading ? 'Registering...' : 'Register' }}
        </button>

        <p class="text-center text-gray-400 text-sm mt-4">
          Already have an account?
          <router-link to="/login" class="text-orange-500 hover:text-orange-400">
            Login here
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
// Сторінка реєстрації

import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'user'
})

// Обробка реєстрації
const handleRegister = async () => {
  try {
    await authStore.register(form)
    router.push('/projects')
  } catch (error) {
    console.error('Register error:', error)
  }
}
</script>
