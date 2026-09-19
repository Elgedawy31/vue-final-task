<script setup>
import BookCover from './BookCover.vue'
import AuthorAvatar from './AuthorAvatar.vue'
import ChatWidget from './ChatWidget.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBooksStore } from './books.js'
import { useAuthorsStore } from './authors.js'
import DataState from './DataState.vue'
import BookCard from './BookCard.vue'
import AppIcon from './AppIcon.vue'
const bookStore = useBooksStore()
const authorStore = useAuthorsStore()
const loading = ref(true)
const error = ref('')
const authorMap = computed(() => {
  const result = {}
  for (const author of authorStore.authors) {
    result[author.id] = author
  }
  return result
})
const genres = computed(() => {
  const result = []
  for (const book of bookStore.books) {
    for (const tag of book.tags) {
      if (!result.includes(tag)) result.push(tag)
    }
  }
  return result.sort()
})

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
  const result = []
  const word = search.value.trim().toLowerCase()
  for (const book of bookStore.books) {
    if (!book.title.toLowerCase().includes(word)) continue
    if (authorId.value && String(book.authorId) !== authorId.value) continue
    if (genre.value && !book.tags.includes(genre.value)) continue
    result.push(book)
  }
  if (sort.value === 'title') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sort.value === 'year') {
    result.sort((a, b) => b.year - a.year)
  } else {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  return result
})
const hasFilters = computed(() => !!search.value || !!authorId.value || !!genre.value)
function reset() {
  search.value = ''
  authorId.value = ''
  genre.value = ''
  router.replace('/books')
}

const book = ref(null)
const author = ref(null)
const chat = ref(null)
const related = computed(() => {
  const result = []
  if (!book.value) return result
  for (const item of bookStore.books) {
    if (item.id === book.value.id) continue
    let matches = item.authorId === book.value.authorId
    for (const tag of item.tags) {
      if (book.value.tags.includes(tag)) matches = true
    }
    if (matches) result.push(item)
    if (result.length === 4) break
  }
  return result
})

async function load() {
  loading.value = true
  error.value = ''
  book.value = null
  author.value = null
  try {
    if (route.params.id) book.value = await bookStore.getBook(route.params.id)
    await bookStore.getBooks()
    await authorStore.getAuthors()
    if (book.value) {
      author.value = authorMap.value[book.value.authorId]
      document.title = `${book.value.title} — Folio`
    }
  } catch (failure) {
    if (failure.status === 404) book.value = null
    else error.value = failure.message
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
<template v-if="!route.params.id">
<div class="container page-space">
    <div class="page-heading"><div>
<p class="eyebrow">THE COLLECTION</p>
<h1>Find a story to get lost in.</h1>
<p class="page-description">Old favorites, new discoveries, and everything in between.</p>
</div></div>
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
          <option v-for="author in authorStore.authors" :key="author.id" :value="String(author.id)">
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
<template v-else>
<div class="container page-space">
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <RouterLink to="/books">The collection</RouterLink
      ><AppIcon name="chevron" :size="14" /><span>{{ book?.title || 'Book details' }}</span>
    </nav>
    <DataState
      :loading="loading"
      :error="error"
      :empty="!book"
      title="This chapter is missing"
      description="This book may have been removed. There are plenty more stories to explore."
      @retry="load"
      ><template #empty
        ><RouterLink to="/books" class="btn btn-primary">Back to books</RouterLink></template
      >
      <div v-if="book" class="book-detail-grid">
        <div class="detail-cover-wrap">
          <BookCover :book="book" :author="author?.name" /><span class="detail-cover-caption"
            ><AppIcon name="book" :size="16" /> A place on your next-reading list.</span
          >
        </div>
        <div class="detail-copy">
          <p class="eyebrow">THE FOLIO COLLECTION</p>
          <h1>{{ book.title }}</h1>
          <RouterLink v-if="author" :to="`/authors/${author.id}`" class="detail-author"
            >by {{ author.name }} <AppIcon name="arrow" :size="16"
          /></RouterLink>
          <div class="detail-tags">
            <RouterLink
              v-for="tag in book.tags"
              :key="tag"
              :to="{ path: '/books', query: { genre: tag } }"
              class="tag"
              >{{ tag }}</RouterLink
            >
          </div>
          <div class="detail-facts">
            <div>
              <span>FIRST PUBLISHED</span><strong>{{ book.year }}</strong>
            </div>
            <div>
              <span>AUTHOR</span><strong>{{ author?.name || 'Unavailable' }}</strong>
            </div>
          </div>
          <h2>Between the covers</h2>
          <p class="book-description">
            {{
              book.description ||
              'A new addition to the collection. More about this story is coming soon.'
            }}
          </p>
          <button class="btn btn-primary" @click="chat?.openChat()">
            <AppIcon name="sparkles" :size="18" /> Talk about this book
          </button>
          <p class="chat-hint">Questions, themes, or a spoiler-free introduction. Just ask.</p>
        </div>
      </div>
      <section v-if="author" class="detail-author-panel">
        <AuthorAvatar :author="author" />
        <div>
          <p class="eyebrow">ABOUT THE AUTHOR</p>
          <h2>{{ author.name }}</h2>
          <p>{{ author.bio || 'Explore more from this author in the collection.' }}</p>
          <RouterLink :to="`/authors/${author.id}`" class="text-link"
            >Meet the author <AppIcon name="arrow" :size="17"
          /></RouterLink>
        </div>
      </section>
      <section v-if="related.length" class="section-space">
        <div class="section-heading">
          <div>
            <p class="eyebrow">KEEP THE PAGES TURNING</p>
            <h2>Your next discovery.</h2>
          </div>
          <RouterLink to="/books" class="text-link"
            >All books <AppIcon name="arrow" :size="18"
          /></RouterLink>
        </div>
        <div class="row g-4">
          <div v-for="item in related" :key="item.id" class="col-6 col-lg-3">
            <BookCard :book="item" :author="authorMap[item.authorId]" />
          </div>
        </div></section></DataState
    ><ChatWidget
      v-if="book && !loading && !error"
      ref="chat"
      entity-type="book"
      :entity-id="book.id"
      :name="book.title"
    />
  </div>
</template>
</template>
