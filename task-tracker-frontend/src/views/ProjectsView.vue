<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Шапка -->
    <header class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-6">
          <h1 class="text-2xl font-bold text-orange-500">Task Tracker</h1>
          <nav class="flex space-x-4">
            <router-link to="/projects" class="text-white hover:text-orange-500">Projects</router-link>
            <router-link to="/tasks" class="text-gray-400 hover:text-orange-500">Tasks</router-link>
            <router-link to="/statuses" class="text-gray-400 hover:text-orange-500">Statuses</router-link>
            <router-link to="/tags" class="text-gray-400 hover:text-orange-500">Tags</router-link>
            <router-link to="/profile" class="text-gray-400 hover:text-orange-500">Profile</router-link>
          </nav>
        </div>
        <button @click="handleLogout" class="btn-danger text-sm">Logout</button>
      </div>
    </header>

    <!-- Контент -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-3xl font-bold text-white">Projects</h2>
          <p class="text-gray-400 mt-1">Manage your projects</p>
        </div>
        <button @click="showCreateModal = true" class="btn-primary">
          + New Project
        </button>
      </div>

      <!-- Завантаження -->
      <div v-if="projectsStore.loading" class="text-center py-12">
        <p class="text-gray-400">Loading projects...</p>
      </div>

      <!-- Помилка -->
      <div v-else-if="projectsStore.error" class="card text-center py-12">
        <p class="text-red-400">{{ projectsStore.error }}</p>
      </div>

      <!-- Пусто -->
      <div v-else-if="projectsStore.projects.length === 0" class="card text-center py-12">
        <p class="text-gray-400">No projects yet. Create your first project!</p>
      </div>

      <!-- Список проектів -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projectsStore.projects"
          :key="project.id"
          class="card hover:border-orange-500 transition cursor-pointer"
          @click="goToProject(project.id)"
        >
          <h3 class="text-xl font-semibold text-white mb-2">{{ project.title }}</h3>
          <p class="text-gray-400 text-sm mb-4 line-clamp-2">
            {{ project.description || 'No description' }}
          </p>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">{{ project.tasks?.length || 0 }} tasks</span>
            <div class="flex space-x-2" @click.stop>
              <button
                @click="editProject(project)"
                class="text-orange-500 hover:text-orange-400"
              >
                Edit
              </button>
              <button
                @click="deleteProject(project)"
                class="text-red-500 hover:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальне вікно -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="closeModals"
    >
      <div class="card max-w-md w-full">
        <h3 class="text-2xl font-bold text-white mb-4">
          {{ showEditModal ? 'Edit Project' : 'New Project' }}
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label">Project Title *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="input-field"
              placeholder="Enter project title"
            />
          </div>
          <div>
            <label class="label">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input-field"
              placeholder="Enter project description"
            ></textarea>
          </div>
          <div v-if="projectsStore.error" class="error-message">
            {{ projectsStore.error }}
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              :disabled="projectsStore.loading"
              class="btn-primary flex-1"
            >
              {{ projectsStore.loading ? 'Saving...' : showEditModal ? 'Update' : 'Create' }}
            </button>
            <button
              type="button"
              @click="closeModals"
              class="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// Сторінка проектів

import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProjectsStore } from '../stores/projects'

const router = useRouter()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingProject = ref(null)

const form = reactive({
  title: '',
  description: ''
})

onMounted(async () => {
  await projectsStore.fetchProjects()
})

// Вихід
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Закрити модалки
const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingProject.value = null
  form.title = ''
  form.description = ''
}

// Редагувати проект
const editProject = (project) => {
  editingProject.value = project
  form.title = project.title
  form.description = project.description || ''
  showEditModal.value = true
}

// Зберегти проект
const handleSubmit = async () => {
  try {
    if (showEditModal.value) {
      await projectsStore.updateProject(editingProject.value.id, form)
    } else {
      await projectsStore.createProject(form)
    }
    closeModals()
  } catch (error) {
    console.error('Submit error:', error)
  }
}

// Видалити проект
const deleteProject = async (project) => {
  if (!confirm(`Delete "${project.title}"?`)) return

  try {
    await projectsStore.deleteProject(project.id)
  } catch (error) {
    console.error('Delete error:', error)
  }
}

// Перейти до проекту
const goToProject = (id) => {
  router.push(`/projects/${id}`)
}
</script>
