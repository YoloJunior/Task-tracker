// Store статусів

import { defineStore } from 'pinia'
import api from '../api/axios'

export const useStatusesStore = defineStore('statuses', {
  state: () => ({
    statuses: [],
    loading: false,
    error: null
  }),

  actions: {
    // Отримати всі статуси
    async fetchStatuses() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/statuses')
        this.statuses = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch statuses'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Створити статус
    async createStatus(statusData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/statuses', statusData)
        this.statuses.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to create status'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Оновити статус
    async updateStatus(id, statusData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/statuses/${id}`, statusData)
        const index = this.statuses.findIndex(s => s.id === id)
        if (index !== -1) {
          this.statuses[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update status'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Видалити статус
    async deleteStatus(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/statuses/${id}`)
        this.statuses = this.statuses.filter(s => s.id !== id)
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete status'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
