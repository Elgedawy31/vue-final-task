import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBooksStore = defineStore('books', () => {
  const books = ref([])
  const loading = ref(false)
  const error = ref('')
  const lastFetchedAt = ref(null)

  async function getBooks() {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch('/data/books')
      if (!response.ok) throw new Error('Could not load books. Please try again.')
      books.value = await response.json()
      lastFetchedAt.value = new Date().toISOString()
      return books.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getBook(id) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch(`/data/books/${encodeURIComponent(id)}`)
      if (!response.ok) {
        const err = new Error('Could not load this book.')
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

  async function addBook(data) {
    loading.value = true
    error.value = ''
    try {
      data.createdAt = new Date().toISOString()
      data.updatedAt = data.createdAt
      const response = await fetch('/data/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Could not add the book. Please try again.')
      const book = await response.json()
      books.value.push(book)
      return book
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function editBook(id, data) {
    loading.value = true
    error.value = ''
    try {
      const oldResponse = await fetch(`/data/books/${encodeURIComponent(id)}`)
      if (!oldResponse.ok) throw new Error('This book is no longer available.')
      const oldData = await oldResponse.json()
      data.createdAt = oldData.createdAt
      data.updatedAt = new Date().toISOString()
      const response = await fetch(`/data/books/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Could not update the book. Please try again.')
      const book = await response.json()
      for (let i = 0; i < books.value.length; i++) {
        if (String(books.value[i].id) === String(id)) {
          books.value[i] = book
          break
        }
      }
      return book
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBook(id) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch(`/data/books/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete the book. Please try again.')
      books.value = books.value.filter(book => String(book.id) !== String(id))
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { books, loading, error, lastFetchedAt, getBooks, getBook, addBook, editBook, deleteBook }
})
