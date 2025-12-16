// Store тегів

import { defineStore } from 'pinia'
import api from '../api/axios'

export const useTagsStore = defineStore('tags', {
  state: () => ({
    tags: [],
    loading: false,
    error: null
  }),

  actions: {
    // Отримати всі теги
    async fetchTags() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/tags')
        this.tags = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch tags'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Створити тег
    async createTag(tagData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/tags', tagData)
        this.tags.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to create tag'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Оновити тег
    async updateTag(id, tagData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/tags/${id}`, tagData)
        const index = this.tags.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tags[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update tag'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Видалити тег
    async deleteTag(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/tags/${id}`)
        this.tags = this.tags.filter(t => t.id !== id)
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete tag'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
