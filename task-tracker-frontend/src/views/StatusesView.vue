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
          <router-link to="/statuses" class="text-white font-semibold">Statuses</router-link>
          <router-link to="/tags" class="text-gray-400 hover:text-white transition">Tags</router-link>
          <router-link to="/profile" class="text-gray-400 hover:text-white transition">Profile</router-link>
        </nav>
      </header>

      <div v-if="statusesStore.error" class="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
        {{ statusesStore.error }}
      </div>

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Statuses</h2>
        <button @click="openCreateModal" class="btn-primary">+ Create Status</button>
      </div>

      <div v-if="statusesStore.loading" class="text-center py-12">
        <p class="text-gray-400">Loading statuses...</p>
      </div>

      <div v-else-if="statusesStore.statuses.length === 0" class="card text-center py-12">
        <p class="text-gray-400">No statuses found. Create your first status!</p>
      </div>

      <!-- Список статусів -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="status in statusesStore.statuses" :key="status.id"
             class="card hover:border-orange-500 transition">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-white mb-2">{{ status.name }}</h3>
              <p class="text-gray-400 text-sm">Sort Order: {{ status.sortOrder }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="openEditModal(status)" class="btn-secondary text-sm">Edit</button>
              <button @click="confirmDelete(status)" class="btn-danger text-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Модалка створення/редагування -->
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h2 class="text-2xl font-bold text-white mb-6">
            {{ showCreateModal ? 'Create New Status' : 'Edit Status' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="label">Status Name *</label>
              <input v-model="formData.name" type="text" required class="input-field"
                     placeholder="Enter status name">
            </div>

            <div>
              <label class="label">Sort Order</label>
              <input v-model="formData.sortOrder" type="number" class="input-field"
                     placeholder="Enter sort order (e.g., 1, 2, 3...)">
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModals" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="statusesStore.loading" class="btn-primary">
                {{ statusesStore.loading ? 'Saving...' : (showCreateModal ? 'Create' : 'Update') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Модалка видалення -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h2 class="text-xl font-bold text-white mb-4">Confirm Delete</h2>
          <p class="text-gray-300 mb-6">
            Are you sure you want to delete the status "{{ statusToDelete?.name }}"? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button @click="showDeleteConfirm = false" class="btn-secondary">Cancel</button>
            <button @click="handleDelete" :disabled="statusesStore.loading" class="btn-danger">
              {{ statusesStore.loading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Сторінка статусів

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useStatusesStore } from '../stores/statuses'

const router = useRouter()
const authStore = useAuthStore()
const statusesStore = useStatusesStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const statusToDelete = ref(null)
const editingStatus = ref(null)

const formData = ref({
  name: '',
  sortOrder: 0
})

onMounted(async () => {
  await statusesStore.fetchStatuses()
})

// Відкрити модалку створення
const openCreateModal = () => {
  formData.value = {
    name: '',
    sortOrder: statusesStore.statuses.length + 1
  }
  showCreateModal.value = true
}

// Відкрити модалку редагування
const openEditModal = (status) => {
  editingStatus.value = status
  formData.value = {
    name: status.name,
    sortOrder: status.sortOrder
  }
  showEditModal.value = true
}

// Закрити модалки
const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingStatus.value = null
}

// Зберегти статус
const handleSubmit = async () => {
  const data = {
    name: formData.value.name,
    sortOrder: parseInt(formData.value.sortOrder) || 0
  }

  if (showCreateModal.value) {
    await statusesStore.createStatus(data)
  } else {
    await statusesStore.updateStatus(editingStatus.value.id, data)
  }

  closeModals()
}

// Підтвердження видалення
const confirmDelete = (status) => {
  statusToDelete.value = status
  showDeleteConfirm.value = true
}

// Видалити статус
const handleDelete = async () => {
  await statusesStore.deleteStatus(statusToDelete.value.id)
  showDeleteConfirm.value = false
  statusToDelete.value = null
}

// Вихід
const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
