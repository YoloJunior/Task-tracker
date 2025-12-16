// Store автентифікації

import { defineStore } from 'pinia'
import api from '../api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.name || 'User'
  },

  actions: {
    // Реєстрація
    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/register', userData)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Вхід
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/login', credentials)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Отримати дані користувача
    async fetchUser() {
      if (!this.token) return
      try {
        const response = await api.get('/auth/me')
        this.user = response.data
      } catch (error) {
        console.error('Fetch user error:', error)
        this.logout()
      }
    },

    // Оновити профіль
    async updateProfile(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put('/auth/profile', userData)
        this.user = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Update failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Вихід
    logout() {
      this.user = null
      this.token = null
      this.error = null
      localStorage.removeItem('token')
    }
  }
})
