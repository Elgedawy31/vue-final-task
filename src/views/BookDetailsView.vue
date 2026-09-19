<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useBooksStore } from '../stores/books'
import { useAuthorsStore } from '../stores/authors'
import BookCover from '../components/BookCover.vue'
import BookCard from '../components/BookCard.vue'
import AuthorAvatar from '../components/AuthorAvatar.vue'
import AppIcon from '../components/AppIcon.vue'
import DataState from '../components/DataState.vue'
import ChatWidget from '../components/ChatWidget.vue'
const route = useRoute()
const books = useBooksStore()
const authors = useAuthorsStore()
const book = ref(null)
const author = ref(null)
const loading = ref(true)
const error = ref('')
const chat = ref(null)
const authorMap = computed(() => Object.fromEntries(authors.items.map((item) => [item.id, item])))
const related = computed(() =>
  books.items
    .filter(
      (item) =>
        item.id !== book.value?.id &&
        (item.authorId === book.value?.authorId ||
          item.tags.some((tag) => book.value?.tags.includes(tag))),
    )
    .slice(0, 4),
)
async function load() {
  loading.value = true
  error.value = ''
  book.value = null
  author.value = null
  try {
    book.value = await books.fetchById(route.params.id)
    await Promise.all([books.fetchList(), authors.fetchList()])
    author.value = authorMap.value[book.value.authorId]
    document.title = `${book.value.title} — Folio`
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
