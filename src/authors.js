import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthorsStore = defineStore('authors', () => {
  const authors = ref([])
  const loading = ref(false)
  const error = ref('')
  const lastFetchedAt = ref(null)

  async function getAuthors() {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch('/data/authors')
      if (!response.ok) throw new Error('Could not load authors. Please try again.')
      authors.value = await response.json()
      lastFetchedAt.value = new Date().toISOString()
      return authors.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getAuthor(id) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch(`/data/authors/${encodeURIComponent(id)}`)
      if (!response.ok) {
        const err = new Error('Could not load this author.')
        err.status = response.status
        throw err
      }
      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addAuthor(data) {
    loading.value = true
    error.value = ''
    try {
      data.createdAt = new Date().toISOString()
      data.updatedAt = data.createdAt
      const response = await fetch('/data/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Could not add the author. Please try again.')
      const author = await response.json()
      authors.value.push(author)
      return author
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function editAuthor(id, data) {
    loading.value = true
    error.value = ''
    try {
      const oldResponse = await fetch(`/data/authors/${encodeURIComponent(id)}`)
      if (!oldResponse.ok) throw new Error('This author is no longer available.')
      const oldData = await oldResponse.json()
      data.createdAt = oldData.createdAt
      data.updatedAt = new Date().toISOString()
      const response = await fetch(`/data/authors/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Could not update the author. Please try again.')
      const author = await response.json()
      for (let i = 0; i < authors.value.length; i++) {
        if (String(authors.value[i].id) === String(id)) {
          authors.value[i] = author
          break
        }
      }
      return author
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAuthor(id) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch(`/data/authors/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete the author. Please try again.')
      authors.value = authors.value.filter(author => String(author.id) !== String(id))
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { authors, loading, error, lastFetchedAt, getAuthors, getAuthor, addAuthor, editAuthor, deleteAuthor }
})
