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
          <router-link to="/tags" class="text-white font-semibold">Tags</router-link>
          <router-link to="/profile" class="text-gray-400 hover:text-white transition">Profile</router-link>
        </nav>
      </header>

      <div v-if="tagsStore.error" class="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
        {{ tagsStore.error }}
      </div>

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Tags</h2>
        <button @click="openCreateModal" class="btn-primary">+ Create Tag</button>
      </div>

      <div v-if="tagsStore.loading" class="text-center py-12">
        <p class="text-gray-400">Loading tags...</p>
      </div>

      <div v-else-if="tagsStore.tags.length === 0" class="card text-center py-12">
        <p class="text-gray-400">No tags found. Create your first tag!</p>
      </div>

      <!-- Список тегів -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="tag in tagsStore.tags" :key="tag.id"
             class="card hover:border-orange-500 transition">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="w-6 h-6 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                <h3 class="text-xl font-semibold text-white">{{ tag.name }}</h3>
              </div>
              <p class="text-gray-400 text-sm">Color: {{ tag.color }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="openEditModal(tag)" class="btn-secondary text-sm">Edit</button>
              <button @click="confirmDelete(tag)" class="btn-danger text-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Модалка створення/редагування -->
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h2 class="text-2xl font-bold text-white mb-6">
            {{ showCreateModal ? 'Create New Tag' : 'Edit Tag' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="label">Tag Name *</label>
              <input v-model="formData.name" type="text" required class="input-field"
                     placeholder="Enter tag name">
            </div>

            <div>
              <label class="label">Color *</label>
              <div class="flex gap-3">
                <input v-model="formData.color" type="color" required
                       class="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer">
                <input v-model="formData.color" type="text" required
                       class="input-field flex-1" placeholder="#3b82f6">
              </div>
              <p class="text-gray-400 text-sm mt-2">Choose a color or enter a hex code</p>
            </div>

            <!-- Прев'ю тегу -->
            <div class="bg-gray-700 p-4 rounded-lg">
              <p class="text-gray-300 text-sm mb-2">Preview:</p>
              <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white"
                    :style="{ backgroundColor: formData.color }">
                <span class="w-4 h-4 rounded-full bg-white bg-opacity-30"></span>
                {{ formData.name || 'Tag Name' }}
              </span>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModals" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="tagsStore.loading" class="btn-primary">
                {{ tagsStore.loading ? 'Saving...' : (showCreateModal ? 'Create' : 'Update') }}
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
            Are you sure you want to delete the tag "{{ tagToDelete?.name }}"? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button @click="showDeleteConfirm = false" class="btn-secondary">Cancel</button>
            <button @click="handleDelete" :disabled="tagsStore.loading" class="btn-danger">
              {{ tagsStore.loading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Сторінка тегів

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTagsStore } from '../stores/tags'

const router = useRouter()
const authStore = useAuthStore()
const tagsStore = useTagsStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const tagToDelete = ref(null)
const editingTag = ref(null)

const formData = ref({
  name: '',
  color: '#3b82f6'
})

onMounted(async () => {
  await tagsStore.fetchTags()
})

// Відкрити модалку створення
const openCreateModal = () => {
  formData.value = {
    name: '',
    color: '#3b82f6'
  }
  showCreateModal.value = true
}

// Відкрити модалку редагування
const openEditModal = (tag) => {
  editingTag.value = tag
  formData.value = {
    name: tag.name,
    color: tag.color
  }
  showEditModal.value = true
}

// Закрити модалки
const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTag.value = null
}

// Зберегти тег
const handleSubmit = async () => {
  const data = {
    name: formData.value.name,
    color: formData.value.color
  }

  if (showCreateModal.value) {
    await tagsStore.createTag(data)
  } else {
    await tagsStore.updateTag(editingTag.value.id, data)
  }

  closeModals()
}

// Підтвердження видалення
const confirmDelete = (tag) => {
  tagToDelete.value = tag
  showDeleteConfirm.value = true
}

// Видалити тег
const handleDelete = async () => {
  await tagsStore.deleteTag(tagToDelete.value.id)
  showDeleteConfirm.value = false
  tagToDelete.value = null
}

// Вихід
const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
