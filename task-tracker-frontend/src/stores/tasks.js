// Store завдань

import { defineStore } from 'pinia'
import api from '../api/axios'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    filters: {
      projectId: null,
      statusId: null,
      tagId: null
    }
  }),

  actions: {
    // Отримати завдання з фільтрами
    async fetchTasks(filters = {}) {
      this.loading = true
      this.error = null
      try {
        const params = new URLSearchParams()
        if (filters.projectId) params.append('projectId', filters.projectId)
        if (filters.statusId) params.append('statusId', filters.statusId)
        if (filters.tagId) params.append('tagId', filters.tagId)

        const response = await api.get(`/tasks?${params.toString()}`)
        this.tasks = response.data
        this.filters = filters
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch tasks'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Отримати завдання за ID
    async fetchTask(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/tasks/${id}`)
        this.currentTask = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch task'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Створити завдання
    async createTask(taskData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/tasks', taskData)
        this.tasks.unshift(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to create task'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Оновити завдання
    async updateTask(id, taskData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/tasks/${id}`, taskData)
        const index = this.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tasks[index] = response.data
        }
        if (this.currentTask?.id === id) {
          this.currentTask = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update task'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Видалити завдання
    async deleteTask(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/tasks/${id}`)
        this.tasks = this.tasks.filter(t => t.id !== id)
        if (this.currentTask?.id === id) {
          this.currentTask = null
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete task'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Очистити фільтри
    clearFilters() {
      this.filters = {
        projectId: null,
        statusId: null,
        tagId: null
      }
    }
  }
})
