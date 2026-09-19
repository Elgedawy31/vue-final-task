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
<div class="container page-space">
    <div class="page-heading"><div>
<p class="eyebrow">THE STORYTELLERS</p>
<h1>Meet the minds behind the pages.</h1>
<p class="page-description">Different voices. Remarkable imaginations. Stories that bring us together.</p>
</div></div>
    <div class="authors-toolbar">
      <div class="search-field">
        <AppIcon name="search" /><label for="author-search" class="visually-hidden"
          >Search authors by name</label
        ><input
          id="author-search"
          v-model="search"
          type="search"
          class="form-control"
          placeholder="Find an author…"
        />
      </div>
      <span class="muted"
        >{{ filtered.length }} {{ filtered.length === 1 ? 'storyteller' : 'storytellers' }} in the
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
        ><button v-if="search" class="btn btn-outline-primary" @click="search = ''">
          Clear search
        </button></template
      >
      <div class="row g-4">
        <div v-for="author in filtered" :key="author.id" class="col-md-6 col-lg-4">
          <article class="author-card">
    <AuthorAvatar :author="author" /><span class="eyebrow">BEHIND THE PAGES</span>
    <h3>
      <RouterLink :to="`/authors/${author.id}`">{{ author.name }}</RouterLink>
    </h3>
    <p>
      {{
        author.bio ||
        'There is a story behind every storyteller. Explore their work in the collection.'
      }}
    </p>
    <RouterLink :to="`/authors/${author.id}`" class="text-link"
      >{{ counts[author.id] || 0 }} {{ counts[author.id] === 1 ? 'book' : 'books' }} in the collection
      <AppIcon name="arrow" :size="18"
    /></RouterLink>
  </article>
        </div></div
    ></DataState>
  </div>
</template>
<template v-else>
<div class="container page-space">
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <RouterLink to="/authors">The storytellers</RouterLink
      ><AppIcon name="chevron" :size="14" /><span>{{ author?.name || 'Author details' }}</span>
    </nav>
    <DataState
      :loading="loading"
      :error="error"
      :empty="!author"
      title="This storyteller isn’t here"
      description="This author may have been removed. Explore the other voices in our collection."
      @retry="load"
      ><template #empty
        ><RouterLink to="/authors" class="btn btn-primary">Back to authors</RouterLink></template
      >
      <section v-if="author" class="author-detail-hero">
        <div class="author-portrait">
          <AuthorAvatar :author="author" /><span class="eyebrow">A VOICE WORTH KNOWING</span>
        </div>
        <div>
          <p class="eyebrow">BEHIND THE PAGES</p>
          <h1>{{ author.name }}</h1>
          <span class="tag"
            >{{ authorBooks.length }} {{ authorBooks.length === 1 ? 'book' : 'books' }} in the
            collection</span
          >
          <p class="author-biography">
            {{
              author.bio ||
              'The biography for this author is coming soon. In the meantime, discover their work below.'
            }}
          </p>
          <button class="btn btn-primary" @click="chat?.openChat()">
            <AppIcon name="sparkles" :size="18" /> Ask about this author
          </button>
        </div>
      </section>
      <section class="section-space">
        <div class="section-heading">
          <div>
            <p class="eyebrow">EXPLORE THEIR WORK</p>
            <h2>Stories by {{ author?.name }}.</h2>
          </div>
        </div>
        <DataState
          :empty="!authorBooks.length"
          title="More stories to come"
          description="There are no books by this author in the collection yet."
          ><div class="row g-4">
            <div v-for="book in authorBooks" :key="book.id" class="col-6 col-md-4 col-lg-3">
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
