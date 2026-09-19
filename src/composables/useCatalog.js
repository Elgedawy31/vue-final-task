import { computed, ref } from 'vue'
import { useBooksStore } from '../stores/books'
import { useAuthorsStore } from '../stores/authors'

export function useCatalog() {
  const books = useBooksStore()
  const authors = useAuthorsStore()
  const loading = ref(true)
  const error = ref('')
  const authorMap = computed(() =>
    Object.fromEntries(authors.items.map((author) => [author.id, author])),
  )
  const recentBooks = computed(() =>
    [...books.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
  )
  const genres = computed(() => [...new Set(books.items.flatMap((book) => book.tags))].sort())

  async function load() {
    loading.value = true
    error.value = ''
    try {
      await books.fetchList()
      await authors.fetchList()
    } catch (failure) {
      error.value = failure.message
    } finally {
      loading.value = false
    }
  }

  return { books, authors, authorMap, recentBooks, genres, loading, error, load }
}
