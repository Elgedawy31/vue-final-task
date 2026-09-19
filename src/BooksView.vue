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
    <div class="container page-space pt-4 pt-md-5 pb-5 px-4">
      <div
        class="page-heading d-flex justify-content-between gap-3 gap-md-4 align-items-start align-items-md-center mb-4"
      >
        <div>
          <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
            THE COLLECTION
          </p>
          <h1 class="fw-normal mb-3">Find a story to get lost in.</h1>
          <p class="page-description text-body-secondary m-0 small">
            Old favorites, new discoveries, and everything in between.
          </p>
        </div>
      </div>
      <div class="catalog-toolbar border rounded-2 p-3 p-md-4 bg-body-tertiary">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <div class="search-field position-relative">
              <AppIcon
                class="position-absolute pe-none text-body-secondary"
                name="search"
              /><label for="book-search" class="visually-hidden"
                >Search books by title</label
              ><input
                id="book-search"
                v-model="search"
                type="search"
                class="form-control ps-5 text-body pe-3 rounded-1 py-2 small"
                placeholder="Search by book title…"
              />
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div>
              <label for="author-filter" class="visually-hidden"
                >Filter by author</label
              ><select
                id="author-filter"
                v-model="authorId"
                class="form-select text-body pe-4 ps-3 rounded-1 py-2 small"
              >
                <option value="">All authors</option>
                <option
                  v-for="author in authorStore.authors"
                  :key="author.id"
                  :value="String(author.id)"
                >
                  {{ author.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div>
              <label for="genre-filter" class="visually-hidden"
                >Filter by genre</label
              ><select
                id="genre-filter"
                v-model="genre"
                class="form-select text-body pe-4 ps-3 rounded-1 py-2 small"
              >
                <option value="">All genres</option>
                <option v-for="tag in genres" :key="tag" :value="tag">
                  {{ tag }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div
        class="results-bar d-flex align-items-center justify-content-between px-0 py-3 py-md-4 small"
      >
        <span
          >{{ filteredBooks.length }}
          {{ filteredBooks.length === 1 ? 'book' : 'books' }}
          <span class="muted text-body-secondary">to explore</span
          ><button
            v-if="hasFilters"
            class="reset-link text-primary bg-transparent border-0 ms-0 ms-md-3 text-decoration-underline small"
            @click="reset"
          >
            Clear filters
            <AppIcon class="flex-shrink-0" name="close" :size="13" /></button
        ></span>
        <div class="sort-control d-flex align-items-center gap-0 gap-md-2">
          <label class="text-body-secondary" for="book-sort">Sort by</label
          ><select
            class="border-0 bg-transparent text-primary small"
            id="book-sort"
            v-model="sort"
          >
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
          ><button
            v-if="hasFilters"
            class="btn btn-outline-primary d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
            @click="reset"
          >
            Clear filters
          </button></template
        >
        <div class="row g-4 gy-5">
          <div
            v-for="book in filteredBooks"
            :key="book.id"
            class="col-6 col-md-4 col-lg-3"
          >
            <BookCard :book="book" :author="authorMap[book.authorId]" />
          </div></div
      ></DataState>
    </div>
  </template>
  <template v-else>
    <div class="container page-space pt-4 pt-md-5 pb-5 px-4">
      <nav
        class="breadcrumb-nav d-flex align-items-center gap-2 text-body-secondary mb-4 flex-wrap small"
        aria-label="Breadcrumb"
      >
        <RouterLink class="text-decoration-none" to="/books"
          >The collection</RouterLink
        ><AppIcon name="chevron" :size="14" /><span class="text-primary">{{
          book?.title || 'Book details'
        }}</span>
      </nav>
      <DataState
        :loading="loading"
        :error="error"
        :empty="!book"
        title="This chapter is missing"
        description="This book may have been removed. There are plenty more stories to explore."
        @retry="load"
        ><template #empty
          ><RouterLink
            to="/books"
            class="btn btn-primary text-decoration-none d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
            >Back to books</RouterLink
          ></template
        >
        <div v-if="book" class="book-detail-grid row g-4 g-lg-5 pb-5">
          <div class="col-md-5 col-lg-4">
            <div
              class="detail-cover-wrap rounded-2 d-flex align-items-center flex-column justify-content-center p-4"
            >
              <BookCover :book="book" :author="author?.name" /><span
                class="detail-cover-caption d-flex align-items-center gap-2 mt-4"
                ><AppIcon name="book" :size="16" /> A place on your next-reading
                list.</span
              >
            </div>
          </div>
          <div class="col-md-7 col-lg-8">
            <div class="detail-copy px-0 py-2">
              <p class="eyebrow mt-0 mb-3 d-block fw-bold mx-0 small">
                THE FOLIO COLLECTION
              </p>
              <h1 class="fw-normal mt-2 mb-3 mx-0">{{ book.title }}</h1>
              <RouterLink
                v-if="author"
                :to="`/authors/${author.id}`"
                class="detail-author text-decoration-none d-inline-flex align-items-center gap-2 small"
                >by {{ author.name }}
                <AppIcon class="flex-shrink-0" name="arrow" :size="16"
              /></RouterLink>
              <div class="detail-tags d-flex gap-2 flex-wrap mx-0 my-4">
                <RouterLink
                  v-for="tag in book.tags"
                  :key="tag"
                  :to="{ path: '/books', query: { genre: tag } }"
                  class="tag text-decoration-none d-inline-flex rounded-1 text-capitalize text-nowrap py-1 px-2 small"
                  >{{ tag }}</RouterLink
                >
              </div>
              <div class="detail-facts mb-4 d-flex gap-5 px-0 py-3">
                <div>
                  <span class="text-body-secondary d-block mb-1 small"
                    >FIRST PUBLISHED</span
                  ><strong class="fw-medium small">{{ book.year }}</strong>
                </div>
                <div>
                  <span class="text-body-secondary d-block mb-1 small"
                    >AUTHOR</span
                  ><strong class="fw-medium small">{{
                    author?.name || 'Unavailable'
                  }}</strong>
                </div>
              </div>
              <h2 class="fw-normal fs-4">Between the covers</h2>
              <p
                class="book-description mt-3 mb-4 text-body-secondary mx-0 small"
              >
                {{
                  book.description ||
                  'A new addition to the collection. More about this story is coming soon.'
                }}
              </p>
              <button
                class="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
                @click="chat?.openChat()"
              >
                <AppIcon class="flex-shrink-0" name="sparkles" :size="18" />
                Talk about this book
              </button>
              <p class="chat-hint mt-2 text-body-secondary mx-0 small">
                Questions, themes, or a spoiler-free introduction. Just ask.
              </p>
            </div>
          </div>
        </div>
        <section
          v-if="author"
          class="detail-author-panel d-flex gap-3 gap-md-4 border rounded-2 p-4 bg-body-tertiary"
        >
          <AuthorAvatar :author="author" />
          <div>
            <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
              ABOUT THE AUTHOR
            </p>
            <h2 class="fw-normal fs-3">{{ author.name }}</h2>
            <p class="mt-0 text-body-secondary mx-0 small">
              {{
                author.bio || 'Explore more from this author in the collection.'
              }}
            </p>
            <RouterLink
              :to="`/authors/${author.id}`"
              class="text-link text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold border-0 bg-transparent p-0 small"
              >Meet the author
              <AppIcon class="flex-shrink-0" name="arrow" :size="17"
            /></RouterLink>
          </div>
        </section>
        <section v-if="related.length" class="section-space py-5">
          <div
            class="section-heading d-flex justify-content-between align-items-end gap-3 mb-4"
          >
            <div>
              <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
                KEEP THE PAGES TURNING
              </p>
              <h2 class="fw-normal mb-2">Your next discovery.</h2>
            </div>
            <RouterLink
              to="/books"
              class="text-link text-decoration-none d-inline-flex align-items-center gap-1 gap-md-2 fw-semibold border-0 bg-transparent mb-1 p-0"
              >All books <AppIcon class="flex-shrink-0" name="arrow" :size="18"
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
