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
  const messages = ref([])
  let nextMessageId = 1
  function dismiss(id) {
    messages.value = messages.value.filter((message) => message.id !== id)
  }
  function show(text, type = 'success') {
    const id = nextMessageId
    nextMessageId++
    messages.value.push({ id, text, type })
    setTimeout(() => dismiss(id), 5000)
  }

  const isAuthenticated = ref(readSession())
  const error = ref('')

  function login(email, password) {
    error.value = ''
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
  }

  function logout() {
    isAuthenticated.value = false
    try {
      sessionStorage.removeItem(sessionKey)
    } catch {
      return
    }
  }

  return { isAuthenticated, error, login, logout, messages, show, dismiss }
})
