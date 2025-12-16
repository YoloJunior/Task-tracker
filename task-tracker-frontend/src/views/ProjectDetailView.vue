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
          <router-link to="/projects" class="text-white font-semibold">Projects</router-link>
          <router-link to="/tasks" class="text-gray-400 hover:text-white transition">Tasks</router-link>
          <router-link to="/statuses" class="text-gray-400 hover:text-white transition">Statuses</router-link>
          <router-link to="/tags" class="text-gray-400 hover:text-white transition">Tags</router-link>
          <router-link to="/profile" class="text-gray-400 hover:text-white transition">Profile</router-link>
        </nav>
      </header>

      <button @click="$router.back()" class="text-orange-500 hover:text-orange-400 mb-4 flex items-center gap-2">
        ← Back to Projects
      </button>

      <div v-if="projectsStore.loading" class="text-center py-12">
        <p class="text-gray-400">Loading project...</p>
      </div>

      <div v-else-if="!project" class="card text-center py-12">
        <p class="text-gray-400">Project not found</p>
      </div>

      <div v-else>
        <!-- Інформація про проект -->
        <div class="card mb-6">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h2 class="text-3xl font-bold text-white mb-2">{{ project.title }}</h2>
              <p class="text-gray-400">{{ project.description || 'No description' }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="openEditModal" class="btn-secondary">Edit Project</button>
              <button @click="confirmDeleteProject" class="btn-danger">Delete Project</button>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-700">
            <p class="text-gray-400 text-sm">
              Created: {{ formatDate(project.createdAt) }}
            </p>
          </div>
        </div>

        <!-- Завдання проекту -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-white">
            Tasks in this Project
            <span class="text-gray-500 text-lg ml-2">({{ projectTasks.length }})</span>
          </h3>
          <button @click="openCreateTaskModal" class="btn-primary">+ Add Task</button>
        </div>

        <div v-if="tasksStore.loading" class="text-center py-12">
          <p class="text-gray-400">Loading tasks...</p>
        </div>

        <div v-else-if="projectTasks.length === 0" class="card text-center py-12">
          <p class="text-gray-400">No tasks in this project yet. Create your first task!</p>
        </div>

        <!-- Список завдань -->
        <div v-else class="space-y-4">
          <div v-for="task in projectTasks" :key="task.id" class="card hover:border-orange-500 transition">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h4 class="text-xl font-semibold text-white mb-2">{{ task.title }}</h4>
                <p class="text-gray-400 text-sm mb-3">{{ task.description || 'No description' }}</p>

                <div class="flex flex-wrap gap-2 mb-3">
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
                  <span v-if="task.dueDate">
                    Due: {{ formatDate(task.dueDate) }}
                  </span>
                  <span v-if="task.assignedTo">
                    Assigned: {{ task.assignedTo.name }}
                  </span>
                  <span>
                    Created: {{ formatDate(task.createdAt) }}
                  </span>
                </div>
              </div>

              <div class="flex gap-2 ml-4">
                <router-link to="/tasks" class="btn-secondary text-sm">View in Tasks</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Модалка редагування проекту -->
      <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
          <h2 class="text-2xl font-bold text-white mb-6">Edit Project</h2>

          <form @submit.prevent="handleEditProject" class="space-y-4">
            <div>
              <label class="label">Project Title *</label>
              <input v-model="projectFormData.title" type="text" required class="input-field"
                     placeholder="Enter project title">
            </div>

            <div>
              <label class="label">Description</label>
              <textarea v-model="projectFormData.description" rows="4" class="input-field"
                        placeholder="Enter project description"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showEditModal = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="projectsStore.loading" class="btn-primary">
                {{ projectsStore.loading ? 'Saving...' : 'Update' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Модалка створення завдання -->
      <div v-if="showCreateTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold text-white mb-6">Create Task for {{ project?.title }}</h2>

          <form @submit.prevent="handleCreateTask" class="space-y-4">
            <div>
              <label class="label">Title *</label>
              <input v-model="taskFormData.title" type="text" required class="input-field"
                     placeholder="Enter task title">
            </div>

            <div>
              <label class="label">Description</label>
              <textarea v-model="taskFormData.description" rows="4" class="input-field"
                        placeholder="Enter task description"></textarea>
            </div>

            <div>
              <label class="label">Status *</label>
              <select v-model="taskFormData.statusId" required class="input-field">
                <option value="">Select status</option>
                <option v-for="status in statusesStore.statuses" :key="status.id" :value="status.id">
                  {{ status.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">Due Date</label>
              <input v-model="taskFormData.dueDate" type="date" class="input-field">
            </div>

            <div>
              <label class="label">Tags</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="tag in tagsStore.tags" :key="tag.id"
                       class="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition">
                  <input type="checkbox" :value="tag.id" v-model="taskFormData.tagIds"
                         class="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500">
                  <span class="text-sm text-white">{{ tag.name }}</span>
                  <span class="w-4 h-4 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showCreateTaskModal = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="tasksStore.loading" class="btn-primary">
                {{ tasksStore.loading ? 'Creating...' : 'Create Task' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Модалка видалення проекту -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h2 class="text-xl font-bold text-white mb-4">Confirm Delete</h2>
          <p class="text-gray-300 mb-6">
            Are you sure you want to delete the project "{{ project?.title }}"? This will also delete all tasks in this project. This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button @click="showDeleteConfirm = false" class="btn-secondary">Cancel</button>
            <button @click="handleDeleteProject" :disabled="projectsStore.loading" class="btn-danger">
              {{ projectsStore.loading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Сторінка деталей проекту

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProjectsStore } from '../stores/projects'
import { useTasksStore } from '../stores/tasks'
import { useStatusesStore } from '../stores/statuses'
import { useTagsStore } from '../stores/tags'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const statusesStore = useStatusesStore()
const tagsStore = useTagsStore()

const showEditModal = ref(false)
const showCreateTaskModal = ref(false)
const showDeleteConfirm = ref(false)

const projectFormData = ref({
  title: '',
  description: ''
})

const taskFormData = ref({
  title: '',
  description: '',
  statusId: '',
  dueDate: '',
  tagIds: []
})

// Поточний проект
const project = computed(() => projectsStore.currentProject)

// Завдання проекту
const projectTasks = computed(() =>
  tasksStore.tasks.filter(task => task.projectId === parseInt(route.params.id))
)

onMounted(async () => {
  const projectId = parseInt(route.params.id)

  await Promise.all([
    projectsStore.fetchProject(projectId),
    tasksStore.fetchTasks({ projectId }),
    statusesStore.fetchStatuses(),
    tagsStore.fetchTags()
  ])
})

// Відкрити модалку редагування
const openEditModal = () => {
  projectFormData.value = {
    title: project.value.title,
    description: project.value.description || ''
  }
  showEditModal.value = true
}

// Відкрити модалку створення завдання
const openCreateTaskModal = () => {
  taskFormData.value = {
    title: '',
    description: '',
    statusId: '',
    dueDate: '',
    tagIds: []
  }
  showCreateTaskModal.value = true
}

// Оновити проект
const handleEditProject = async () => {
  await projectsStore.updateProject(project.value.id, projectFormData.value)
  showEditModal.value = false
}

// Створити завдання
const handleCreateTask = async () => {
  const data = {
    ...taskFormData.value,
    projectId: parseInt(route.params.id),
    statusId: parseInt(taskFormData.value.statusId),
    dueDate: taskFormData.value.dueDate || null
  }

  await tasksStore.createTask(data)
  showCreateTaskModal.value = false

  await tasksStore.fetchTasks({ projectId: parseInt(route.params.id) })
}

// Підтвердження видалення проекту
const confirmDeleteProject = () => {
  showDeleteConfirm.value = true
}

// Видалити проект
const handleDeleteProject = async () => {
  await projectsStore.deleteProject(project.value.id)
  router.push('/projects')
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
