// Store проектів

import { defineStore } from 'pinia'
import api from '../api/axios'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null
  }),

  actions: {
    // Отримати всі проекти
    async fetchProjects() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/projects')
        this.projects = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch projects'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Отримати проект за ID
    async fetchProject(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/projects/${id}`)
        this.currentProject = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch project'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Створити проект
    async createProject(projectData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/projects', projectData)
        this.projects.unshift(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to create project'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Оновити проект
    async updateProject(id, projectData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/projects/${id}`, projectData)
        const index = this.projects.findIndex(p => p.id === id)
        if (index !== -1) {
          this.projects[index] = response.data
        }
        if (this.currentProject?.id === id) {
          this.currentProject = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update project'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Видалити проект
    async deleteProject(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/projects/${id}`)
        this.projects = this.projects.filter(p => p.id !== id)
        if (this.currentProject?.id === id) {
          this.currentProject = null
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete project'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
