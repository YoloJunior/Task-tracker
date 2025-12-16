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
          <router-link to="/tasks" class="text-white font-semibold">Tasks</router-link>
          <router-link to="/statuses" class="text-gray-400 hover:text-white transition">Statuses</router-link>
          <router-link to="/tags" class="text-gray-400 hover:text-white transition">Tags</router-link>
          <router-link to="/profile" class="text-gray-400 hover:text-white transition">Profile</router-link>
        </nav>
      </header>

      <div v-if="tasksStore.error" class="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
        {{ tasksStore.error }}
      </div>

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Tasks</h2>
        <button @click="openCreateModal" class="btn-primary">+ Create Task</button>
      </div>

      <!-- Фільтри -->
      <div class="card mb-6">
        <h3 class="text-lg font-semibold text-white mb-4">Filters</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="label">Project</label>
            <select v-model="filters.projectId" @change="applyFilters" class="input-field">
              <option :value="null">All Projects</option>
              <option v-for="project in projectsStore.projects" :key="project.id" :value="project.id">
                {{ project.title }}
              </option>
            </select>
          </div>
          <div>
            <label class="label">Status</label>
            <select v-model="filters.statusId" @change="applyFilters" class="input-field">
              <option :value="null">All Statuses</option>
              <option v-for="status in statusesStore.statuses" :key="status.id" :value="status.id">
                {{ status.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="label">Tag</label>
            <select v-model="filters.tagId" @change="applyFilters" class="input-field">
              <option :value="null">All Tags</option>
              <option v-for="tag in tagsStore.tags" :key="tag.id" :value="tag.id">
                {{ tag.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="tasksStore.loading" class="text-center py-12">
        <p class="text-gray-400">Loading tasks...</p>
      </div>

      <div v-else-if="tasksStore.tasks.length === 0" class="card text-center py-12">
        <p class="text-gray-400">No tasks found. Create your first task!</p>
      </div>

      <!-- Список завдань -->
      <div v-else class="space-y-4">
        <div v-for="task in tasksStore.tasks" :key="task.id" class="card hover:border-orange-500 transition">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-white mb-2">{{ task.title }}</h3>
              <p class="text-gray-400 text-sm mb-3">{{ task.description }}</p>

              <div class="flex flex-wrap gap-2 mb-3">
                <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                  {{ task.project?.title || 'No Project' }}
                </span>
                <span class="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm">
                  {{ task.status?.name || 'No Status' }}
                </span>
                <span v-for="tag in task.tags" :key="tag.id"
                      class="px-3 py-1 rounded-full text-sm text-white"
                      :style="{ backgroundColor: tag.color }">
                  {{ tag.name }}
                </span>
              </div>

              <div class="flex gap-4 text-sm text-gray-400">
                <span v-if="task.dueDate">Due: {{ formatDate(task.dueDate) }}</span>
                <span v-if="task.assignedTo">Assigned: {{ task.assignedTo.name }}</span>
              </div>
            </div>

            <div class="flex gap-2 ml-4">
              <button @click="openEditModal(task)" class="btn-secondary text-sm">Edit</button>
              <button @click="confirmDelete(task)" class="btn-danger text-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Модалка створення/редагування -->
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold text-white mb-6">
            {{ showCreateModal ? 'Create New Task' : 'Edit Task' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="label">Title *</label>
              <input v-model="formData.title" type="text" required class="input-field"
                     placeholder="Enter task title">
            </div>

            <div>
              <label class="label">Description</label>
              <textarea v-model="formData.description" rows="4" class="input-field"
                        placeholder="Enter task description"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">Project *</label>
                <select v-model="formData.projectId" required class="input-field">
                  <option value="">Select project</option>
                  <option v-for="project in projectsStore.projects" :key="project.id" :value="project.id">
                    {{ project.title }}
                  </option>
                </select>
              </div>

              <div>
                <label class="label">Status *</label>
                <select v-model="formData.statusId" required class="input-field">
                  <option value="">Select status</option>
                  <option v-for="status in statusesStore.statuses" :key="status.id" :value="status.id">
                    {{ status.name }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="label">Due Date</label>
              <input v-model="formData.dueDate" type="date" class="input-field">
            </div>

            <div>
              <label class="label">Tags</label>
              <div class="flex flex-wrap gap-2 mb-2">
                <label v-for="tag in tagsStore.tags" :key="tag.id"
                       class="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition">
                  <input type="checkbox" :value="tag.id" v-model="formData.tagIds"
                         class="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500">
                  <span class="text-sm text-white">{{ tag.name }}</span>
                  <span class="w-4 h-4 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                </label>
              </div>
            </div>

            <div v-if="authStore.isAdmin">
              <label class="label">Assign To User (Admin only)</label>
              <select v-model="formData.assignedToId" class="input-field">
                <option :value="null">Unassigned</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.email }})
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModals" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="tasksStore.loading" class="btn-primary">
                {{ tasksStore.loading ? 'Saving...' : (showCreateModal ? 'Create' : 'Update') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Модалка підтвердження видалення -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h2 class="text-xl font-bold text-white mb-4">Confirm Delete</h2>
          <p class="text-gray-300 mb-6">
            Are you sure you want to delete the task "{{ taskToDelete?.title }}"? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button @click="showDeleteConfirm = false" class="btn-secondary">Cancel</button>
            <button @click="handleDelete" :disabled="tasksStore.loading" class="btn-danger">
              {{ tasksStore.loading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Сторінка завдань

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTasksStore } from '../stores/tasks'
import { useProjectsStore } from '../stores/projects'
import { useStatusesStore } from '../stores/statuses'
import { useTagsStore } from '../stores/tags'
import api from '../api/axios'

const router = useRouter()
const authStore = useAuthStore()
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const statusesStore = useStatusesStore()
const tagsStore = useTagsStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const taskToDelete = ref(null)
const editingTask = ref(null)
const users = ref([])

const filters = ref({
  projectId: null,
  statusId: null,
  tagId: null
})

const formData = ref({
  title: '',
  description: '',
  projectId: '',
  statusId: '',
  dueDate: '',
  tagIds: [],
  assignedToId: null
})

onMounted(async () => {
  await Promise.all([
    tasksStore.fetchTasks(),
    projectsStore.fetchProjects(),
    statusesStore.fetchStatuses(),
    tagsStore.fetchTags()
  ])

  if (authStore.isAdmin) {
    await fetchUsers()
  }
})

// Отримати користувачів для призначення
const fetchUsers = async () => {
  try {
    const response = await api.get('/auth/users')
    users.value = response.data
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

// Застосувати фільтри
const applyFilters = () => {
  tasksStore.fetchTasks(filters.value)
}

// Відкрити модалку створення
const openCreateModal = () => {
  formData.value = {
    title: '',
    description: '',
    projectId: '',
    statusId: '',
    dueDate: '',
    tagIds: [],
    assignedToId: null
  }
  showCreateModal.value = true
}

// Відкрити модалку редагування
const openEditModal = (task) => {
  editingTask.value = task
  formData.value = {
    title: task.title,
    description: task.description || '',
    projectId: task.projectId,
    statusId: task.statusId,
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    tagIds: task.tags ? task.tags.map(t => t.id) : [],
    assignedToId: task.assignedToId || null
  }
  showEditModal.value = true
}

// Закрити модалки
const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTask.value = null
}

// Зберегти завдання
const handleSubmit = async () => {
  const data = {
    ...formData.value,
    projectId: parseInt(formData.value.projectId),
    statusId: parseInt(formData.value.statusId),
    dueDate: formData.value.dueDate || null,
    assignedToId: formData.value.assignedToId ? parseInt(formData.value.assignedToId) : null
  }

  if (showCreateModal.value) {
    await tasksStore.createTask(data)
  } else {
    await tasksStore.updateTask(editingTask.value.id, data)
  }

  closeModals()
  applyFilters()
}

// Підтвердження видалення
const confirmDelete = (task) => {
  taskToDelete.value = task
  showDeleteConfirm.value = true
}

// Видалити завдання
const handleDelete = async () => {
  await tasksStore.deleteTask(taskToDelete.value.id)
  showDeleteConfirm.value = false
  taskToDelete.value = null
  applyFilters()
}

// Форматування дати
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Вихід
const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
