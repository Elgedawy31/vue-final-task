import { ref } from 'vue'
import { defineStore } from 'pinia'

const sessionKey = 'folio-admin-session'

function readSession() {
  try {
    return sessionStorage.getItem(sessionKey) === 'active'
  } catch {
    return false
  }
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(readSession())
  const loading = ref(false)
  const error = ref('')

  function login(email, password) {
    error.value = ''
    loading.value = true
    try {
      if (email.trim().toLowerCase() !== 'admin@folio.com' || password !== 'Folio123!') {
        error.value = 'The email or password is incorrect.'
        return false
      }
      isAuthenticated.value = true
      try {
        sessionStorage.setItem(sessionKey, 'active')
      } catch {
        return true
      }
      return true
    } finally {
      loading.value = false
    }
  }

  function logout() {
    isAuthenticated.value = false
    try {
      sessionStorage.removeItem(sessionKey)
    } catch {
      return
    }
  }

  return { isAuthenticated, loading, error, login, logout }
})
