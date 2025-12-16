<template>
  <div class="min-h-screen bg-gray-900 px-4 py-8">
    <div class="max-w-7xl mx-auto">
      <header class="bg-gray-800 border-b border-gray-700 -mx-4 px-4 py-4 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold text-white">Task Tracker</h1>
          <div class="flex items-center gap-4">
            <span class="text-gray-300">{{ authStore.userName }}</span>
            <button @click="logout" class="btn-secondary">Logout</button>
          </div>
        </div>
        <nav class="flex space-x-4">
          <router-link to="/projects" class="text-gray-400 hover:text-white transition">Projects</router-link>
          <router-link to="/tasks" class="text-gray-400 hover:text-white transition">Tasks</router-link>
          <router-link to="/statuses" class="text-gray-400 hover:text-white transition">Statuses</router-link>
          <router-link to="/tags" class="text-gray-400 hover:text-white transition">Tags</router-link>
          <router-link to="/profile" class="text-white font-semibold">Profile</router-link>
        </nav>
      </header>

      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-white mb-6">My Profile</h2>

        <div v-if="successMessage" class="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-6">
          {{ successMessage }}
        </div>

        <div v-if="authStore.error" class="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
          {{ authStore.error }}
        </div>

        <!-- Інформація акаунту -->
        <div class="card mb-6">
          <h3 class="text-xl font-semibold text-white mb-4">Account Information</h3>

          <div class="space-y-4">
            <div>
              <label class="label">Name</label>
              <input v-model="formData.name" type="text" class="input-field"
                     :disabled="!isEditing" :class="{ 'opacity-60': !isEditing }">
            </div>

            <div>
              <label class="label">Email</label>
              <input v-model="authStore.user.email" type="email" disabled
                     class="input-field opacity-60 cursor-not-allowed">
              <p class="text-gray-400 text-sm mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label class="label">Role</label>
              <div class="flex items-center gap-2">
                <span class="px-4 py-2 bg-gray-700 text-white rounded-lg">
                  {{ authStore.user.role === 'admin' ? 'Administrator' : 'User' }}
                </span>
                <span v-if="authStore.user.role === 'admin'" class="text-orange-500 text-sm">
                  You have admin privileges
                </span>
              </div>
            </div>

            <div>
              <label class="label">Member Since</label>
              <input v-model="formattedDate" type="text" disabled
                     class="input-field opacity-60 cursor-not-allowed">
            </div>
          </div>

          <div class="flex gap-3 mt-6 pt-6 border-t border-gray-700">
            <button v-if="!isEditing" @click="startEditing" class="btn-primary">
              Edit Profile
            </button>
            <template v-else>
              <button @click="saveProfile" :disabled="authStore.loading" class="btn-primary">
                {{ authStore.loading ? 'Saving...' : 'Save Changes' }}
              </button>
              <button @click="cancelEditing" class="btn-secondary">
                Cancel
              </button>
            </template>
          </div>
        </div>

        <!-- Статистика -->
        <div class="card">
          <h3 class="text-xl font-semibold text-white mb-4">Statistics</h3>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-700 p-4 rounded-lg">
              <p class="text-gray-400 text-sm mb-1">Projects</p>
              <p class="text-2xl font-bold text-white">{{ stats.projects }}</p>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <p class="text-gray-400 text-sm mb-1">Tasks</p>
              <p class="text-2xl font-bold text-white">{{ stats.tasks }}</p>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <p class="text-gray-400 text-sm mb-1">Statuses</p>
              <p class="text-2xl font-bold text-white">{{ stats.statuses }}</p>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <p class="text-gray-400 text-sm mb-1">Tags</p>
              <p class="text-2xl font-bold text-white">{{ stats.tags }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Сторінка профілю

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProjectsStore } from '../stores/projects'
import { useTasksStore } from '../stores/tasks'
import { useStatusesStore } from '../stores/statuses'
import { useTagsStore } from '../stores/tags'

const router = useRouter()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const statusesStore = useStatusesStore()
const tagsStore = useTagsStore()

const isEditing = ref(false)
const successMessage = ref('')
const formData = ref({
  name: ''
})

// Форматована дата реєстрації
const formattedDate = computed(() => {
  if (!authStore.user.createdAt) return 'N/A'
  const date = new Date(authStore.user.createdAt)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

// Статистика
const stats = computed(() => ({
  projects: projectsStore.projects.length,
  tasks: tasksStore.tasks.length,
  statuses: statusesStore.statuses.length,
  tags: tagsStore.tags.length
}))

onMounted(async () => {
  formData.value.name = authStore.user.name

  await Promise.all([
    projectsStore.fetchProjects(),
    tasksStore.fetchTasks(),
    statusesStore.fetchStatuses(),
    tagsStore.fetchTags()
  ])
})

// Почати редагування
const startEditing = () => {
  isEditing.value = true
  successMessage.value = ''
}

// Скасувати редагування
const cancelEditing = () => {
  isEditing.value = false
  formData.value.name = authStore.user.name
}

// Зберегти профіль
const saveProfile = async () => {
  await authStore.updateProfile({ name: formData.value.name })

  if (!authStore.error) {
    successMessage.value = 'Profile updated successfully!'
    isEditing.value = false

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}

// Вихід
const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
