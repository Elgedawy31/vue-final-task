<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthorsStore } from '../stores/authors'
import { useBooksStore } from '../stores/books'
import AuthorAvatar from '../components/AuthorAvatar.vue'
import BookCard from '../components/BookCard.vue'
import DataState from '../components/DataState.vue'
import AppIcon from '../components/AppIcon.vue'
import ChatWidget from '../components/ChatWidget.vue'
const route = useRoute()
const authors = useAuthorsStore()
const books = useBooksStore()
const author = ref(null)
const loading = ref(true)
const error = ref('')
const chat = ref(null)
const authorBooks = computed(() =>
  books.items.filter((book) => String(book.authorId) === String(author.value?.id)),
)
async function load() {
  loading.value = true
  error.value = ''
  author.value = null
  try {
    author.value = await authors.fetchById(route.params.id)
    await books.fetchList()
    document.title = `${author.value.name} — Folio`
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
