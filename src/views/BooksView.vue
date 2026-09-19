<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalog } from '../composables/useCatalog'
import PageHeading from '../components/PageHeading.vue'
import DataState from '../components/DataState.vue'
import BookCard from '../components/BookCard.vue'
import AppIcon from '../components/AppIcon.vue'
const { books, authors, authorMap, genres, loading, error, load } = useCatalog()
const route = useRoute()
const router = useRouter()
const search = ref('')
const authorId = ref('')
const genre = ref(String(route.query.genre || ''))
const sort = ref('recent')
watch(
  () => route.query.genre,
  (value) => {
    genre.value = String(value || '')
  },
)
const filteredBooks = computed(() => {
  const matches = books.items.filter(
    (book) =>
      book.title.toLowerCase().includes(search.value.trim().toLowerCase()) &&
      (!authorId.value || String(book.authorId) === authorId.value) &&
      (!genre.value || book.tags.includes(genre.value)),
  )
  if (sort.value === 'title') return matches.sort((a, b) => a.title.localeCompare(b.title))
  if (sort.value === 'year') return matches.sort((a, b) => b.year - a.year)
  return matches.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})
const hasFilters = computed(() => !!search.value || !!authorId.value || !!genre.value)
function reset() {
  search.value = ''
  authorId.value = ''
  genre.value = ''
  router.replace('/books')
}
onMounted(load)
</script>

<template>
  <div class="container page-space">
    <PageHeading
      eyebrow="THE COLLECTION"
      title="Find a story to get lost in."
      description="Old favorites, new discoveries, and everything in between."
    />
    <div class="catalog-toolbar">
      <div class="search-field">
        <AppIcon name="search" /><label for="book-search" class="visually-hidden"
          >Search books by title</label
        ><input
          id="book-search"
          v-model="search"
          type="search"
          class="form-control"
          placeholder="Search by book title…"
        />
      </div>
      <div>
        <label for="author-filter" class="visually-hidden">Filter by author</label
        ><select id="author-filter" v-model="authorId" class="form-select">
          <option value="">All authors</option>
          <option v-for="author in authors.items" :key="author.id" :value="String(author.id)">
            {{ author.name }}
          </option>
        </select>
      </div>
      <div>
        <label for="genre-filter" class="visually-hidden">Filter by genre</label
        ><select id="genre-filter" v-model="genre" class="form-select">
          <option value="">All genres</option>
          <option v-for="tag in genres" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>
    </div>
    <div class="results-bar">
      <span
        >{{ filteredBooks.length }} {{ filteredBooks.length === 1 ? 'book' : 'books' }}
        <span class="muted">to explore</span
        ><button v-if="hasFilters" class="reset-link" @click="reset">
          Clear filters <AppIcon name="close" :size="13" /></button
      ></span>
      <div class="sort-control">
        <label for="book-sort">Sort by</label
        ><select id="book-sort" v-model="sort">
          <option value="recent">Recently added</option>
          <option value="title">Title A–Z</option>
          <option value="year">Publication year</option>
        </select>
      </div>
    </div>
    <DataState
      :loading="loading"
      :error="error"
      :empty="!filteredBooks.length"
      title="No books on this shelf"
      description="Try another title, author, or genre to find your next read."
      @retry="load"
      ><template #empty
        ><button v-if="hasFilters" class="btn btn-outline-primary" @click="reset">
          Clear filters
        </button></template
      >
      <div class="row g-4 gy-5">
        <div v-for="book in filteredBooks" :key="book.id" class="col-6 col-md-4 col-lg-3">
          <BookCard :book="book" :author="authorMap[book.authorId]" />
        </div></div
    ></DataState>
  </div>
</template>
