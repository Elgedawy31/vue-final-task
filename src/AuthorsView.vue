<script setup>
import { computed, onMounted, ref } from 'vue'
import { useBooksStore } from './books.js'
import { useAuthorsStore } from './authors.js'
import { useRoute } from 'vue-router'
import BookCard from './BookCard.vue'
import AuthorAvatar from './AuthorAvatar.vue'
import ChatWidget from './ChatWidget.vue'
import DataState from './DataState.vue'
import AppIcon from './AppIcon.vue'
const route = useRoute()
const bookStore = useBooksStore()
const authorStore = useAuthorsStore()
const loading = ref(true)
const error = ref('')

const search = ref('')
const filtered = computed(() =>
  authorStore.authors.filter((author) =>
    author.name.toLowerCase().includes(search.value.trim().toLowerCase()),
  ),
)
const counts = computed(() => {
  const result = {}
  for (const book of bookStore.books) {
    if (!result[book.authorId]) result[book.authorId] = 0
    result[book.authorId]++
  }
  return result
})

const author = ref(null)
const chat = ref(null)
const authorBooks = computed(() =>
  bookStore.books.filter((book) => String(book.authorId) === String(author.value?.id)),
)

async function load() {
  loading.value = true
  error.value = ''
  author.value = null
  try {
    if (route.params.id) author.value = await authorStore.getAuthor(route.params.id)
    await authorStore.getAuthors()
    await bookStore.getBooks()
    if (author.value) document.title = `${author.value.name} — Folio`
  } catch (failure) {
    if (failure.status === 404) author.value = null
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
            THE STORYTELLERS
          </p>
          <h1 class="fw-normal mb-3">Meet the minds behind the pages.</h1>
          <p class="page-description text-body-secondary m-0 small">
            Different voices. Remarkable imaginations. Stories that bring us
            together.
          </p>
        </div>
      </div>
      <div
        class="authors-toolbar d-flex justify-content-between align-items-start align-items-md-center gap-3 mb-4 small"
      >
        <div class="search-field position-relative">
          <AppIcon
            class="position-absolute pe-none text-body-secondary"
            name="search"
          /><label for="author-search" class="visually-hidden"
            >Search authors by name</label
          ><input
            id="author-search"
            v-model="search"
            type="search"
            class="form-control ps-5 text-body pe-3 rounded-1 py-2 small"
            placeholder="Find an author…"
          />
        </div>
        <span class="muted text-body-secondary"
          >{{ filtered.length }}
          {{ filtered.length === 1 ? 'storyteller' : 'storytellers' }} in the
          collection</span
        >
      </div>
      <DataState
        :loading="loading"
        :error="error"
        :empty="!filtered.length"
        title="No authors found"
        description="Try a different name. There are more voices to discover."
        @retry="load"
        ><template #empty
          ><button
            v-if="search"
            class="btn btn-outline-primary d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
            @click="search = ''"
          >
            Clear search
          </button></template
        >
        <div class="row g-4">
          <div
            v-for="author in filtered"
            :key="author.id"
            class="col-md-6 col-lg-4"
          >
            <article
              class="author-card border rounded-2 h-100 p-4 bg-body-tertiary"
            >
              <AuthorAvatar :author="author" /><span
                class="eyebrow d-block fw-bold mb-2 small"
                >BEHIND THE PAGES</span
              >
              <h3 class="fw-normal fs-3">
                <RouterLink
                  class="text-decoration-none"
                  :to="`/authors/${author.id}`"
                  >{{ author.name }}</RouterLink
                >
              </h3>
              <p
                class="mt-3 mb-4 text-body-secondary overflow-hidden mx-0 small"
              >
                {{
                  author.bio ||
                  'There is a story behind every storyteller. Explore their work in the collection.'
                }}
              </p>
              <RouterLink
                :to="`/authors/${author.id}`"
                class="text-link text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold border-0 bg-transparent p-0 small"
                >{{ counts[author.id] || 0 }}
                {{ counts[author.id] === 1 ? 'book' : 'books' }} in the
                collection
                <AppIcon class="flex-shrink-0" name="arrow" :size="18"
              /></RouterLink>
            </article>
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
        <RouterLink class="text-decoration-none" to="/authors"
          >The storytellers</RouterLink
        ><AppIcon name="chevron" :size="14" /><span class="text-primary">{{
          author?.name || 'Author details'
        }}</span>
      </nav>
      <DataState
        :loading="loading"
        :error="error"
        :empty="!author"
        title="This storyteller isn’t here"
        description="This author may have been removed. Explore the other voices in our collection."
        @retry="load"
        ><template #empty
          ><RouterLink
            to="/authors"
            class="btn btn-primary text-decoration-none d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
            >Back to authors</RouterLink
          ></template
        >
        <section
          v-if="author"
          class="author-detail-hero row g-4 g-lg-5 align-items-center"
        >
          <div class="col-md-4">
            <div
              class="author-portrait d-flex flex-column align-items-center justify-content-center gap-4 rounded-2 p-4"
            >
              <AuthorAvatar :author="author" /><span
                class="eyebrow d-block fw-bold m-0"
                >A VOICE WORTH KNOWING</span
              >
            </div>
          </div>
          <div class="col-md-8">
            <div>
              <p class="eyebrow mt-0 mb-3 d-block fw-bold mx-0 small">
                BEHIND THE PAGES
              </p>
              <h1 class="fw-normal mt-2 mb-3 mx-0">{{ author.name }}</h1>
              <span
                class="tag d-inline-flex rounded-1 text-capitalize text-nowrap py-1 px-2 small"
                >{{ authorBooks.length }}
                {{ authorBooks.length === 1 ? 'book' : 'books' }} in the
                collection</span
              >
              <p class="author-biography text-body-secondary mx-0 my-4 small">
                {{
                  author.bio ||
                  'The biography for this author is coming soon. In the meantime, discover their work below.'
                }}
              </p>
              <button
                class="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
                @click="chat?.openChat()"
              >
                <AppIcon class="flex-shrink-0" name="sparkles" :size="18" /> Ask
                about this author
              </button>
            </div>
          </div>
        </section>
        <section class="section-space py-5">
          <div
            class="section-heading d-flex justify-content-between align-items-end gap-3 mb-4"
          >
            <div>
              <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
                EXPLORE THEIR WORK
              </p>
              <h2 class="fw-normal mb-2">Stories by {{ author?.name }}.</h2>
            </div>
          </div>
          <DataState
            :empty="!authorBooks.length"
            title="More stories to come"
            description="There are no books by this author in the collection yet."
            ><div class="row g-4">
              <div
                v-for="book in authorBooks"
                :key="book.id"
                class="col-6 col-md-4 col-lg-3"
              >
                <BookCard :book="book" :author="author" />
              </div></div
          ></DataState></section></DataState
      ><ChatWidget
        v-if="author && !loading && !error"
        ref="chat"
        entity-type="author"
        :entity-id="author.id"
        :name="author.name"
      />
    </div>
  </template>
</template>
