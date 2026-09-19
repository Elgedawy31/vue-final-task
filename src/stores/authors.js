import { ref } from 'vue'
import { defineStore } from 'pinia'
import { request } from '../api'

export const useAuthorsStore = defineStore('authors', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref('')
  const lastFetchedAt = ref(null)

  async function fetchList() {
    loading.value = true
    error.value = ''
    try {
      items.value = await request('/authors')
      lastFetchedAt.value = new Date().toISOString()
      return items.value
    } catch (failure) {
      error.value = failure.message
      throw failure
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id) {
    loading.value = true
    error.value = ''
    try {
      return await request(`/authors/${encodeURIComponent(id)}`)
    } catch (failure) {
      error.value = failure.message
      throw failure
    } finally {
      loading.value = false
    }
  }

  async function create(values) {
    loading.value = true
    error.value = ''
    try {
      const now = new Date().toISOString()
      const item = await request('/authors', {
        method: 'POST',
        body: JSON.stringify({ ...values, createdAt: now, updatedAt: now }),
      })
      items.value.push(item)
      return item
    } catch (failure) {
      error.value = failure.message
      throw failure
    } finally {
      loading.value = false
    }
  }

  async function update(id, values) {
    loading.value = true
    error.value = ''
    try {
      const current = await request(`/authors/${encodeURIComponent(id)}`)
      const item = await request(`/authors/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify({ ...current, ...values, updatedAt: new Date().toISOString() }),
      })
      const index = items.value.findIndex(item => String(item.id) === String(id))
      if (index !== -1) items.value[index] = item
      return item
    } catch (failure) {
      error.value = failure.message
      throw failure
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    error.value = ''
    try {
      await request(`/authors/${encodeURIComponent(id)}`, { method: 'DELETE' })
      items.value = items.value.filter(item => String(item.id) !== String(id))
    } catch (failure) {
      error.value = failure.message
      throw failure
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, lastFetchedAt, fetchList, fetchById, create, update, remove }
})
