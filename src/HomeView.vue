<script setup>
import { computed, onMounted, ref } from 'vue'
import { useBooksStore } from './books.js'
import { useAuthorsStore } from './authors.js'
import AppIcon from './AppIcon.vue'
import BookCover from './BookCover.vue'
import BookCard from './BookCard.vue'
import DataState from './DataState.vue'
import AuthorAvatar from './AuthorAvatar.vue'
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
const recentBooks = computed(() => {
  const result = bookStore.books.slice()
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return result.slice(0, 4)
})
async function load() {
  loading.value = true
  error.value = ''
  try {
    await bookStore.getBooks()
    await authorStore.getAuthors()
  } catch (failure) {
    error.value = failure.message
  } finally {
    loading.value = false
  }
}

const featured = computed(() => bookStore.books.slice(0, 3))
const featuredAuthors = computed(() => authorStore.authors.slice(0, 4))
const features = [
  {
    icon: 'book',
    title: 'Find your next favorite',
    text: 'From timeless classics to new adventures, a good story is always within reach.',
  },
  {
    icon: 'users',
    title: 'Meet the minds behind it',
    text: 'Go beyond the cover. Discover the writers who bring these worlds to life.',
  },
  {
    icon: 'sparkles',
    title: 'Let curiosity lead',
    text: 'A reading companion for your questions. Explore a book or author, one conversation at a time.',
  },
]
onMounted(load)
</script>

<template>
  <section class="home-hero overflow-hidden">
    <div class="container px-4">
      <div class="hero-grid row align-items-center g-4">
        <div class="col-md-6">
          <div class="hero-copy pt-5 pb-1 pb-md-5 px-0">
            <p
              class="eyebrow mt-0 mb-3 d-flex fw-bold align-items-center gap-2 mx-0 small"
            >
              <span class="small-line bg-primary"></span> FOR THE LOVE OF
              READING
            </p>
            <h1 class="fw-normal mx-0 my-4">
              A little curiosity.<br />A whole new
              <em class="fw-normal text-body-secondary">chapter.</em>
            </h1>
            <p class="hero-description mt-0 text-body-secondary mx-0 small">
              Discover stories that stay with you.<br class="desktop-break" />
              Meet the authors who make them possible.
            </p>
            <div
              class="hero-actions d-flex align-items-center gap-4 gap-md-3 gap-lg-4 mt-4"
            >
              <RouterLink
                to="/books"
                class="btn btn-primary text-decoration-none d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none p-3 py-md-2 py-lg-3 px-lg-4 small"
                >Explore the collection
                <AppIcon
                  class="flex-shrink-0"
                  name="arrow"
                  :size="18" /></RouterLink
              ><RouterLink
                to="/about"
                class="text-link text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold border-0 bg-transparent p-0 small"
                >Our story
                <AppIcon class="flex-shrink-0" name="arrow" :size="17"
              /></RouterLink>
            </div>
            <div
              class="hero-proof d-flex align-items-center mt-4 mt-md-5 gap-3"
            >
              <div class="avatar-stack d-flex ps-1">
                <AuthorAvatar
                  v-for="author in featuredAuthors"
                  :key="author.id"
                  :author="author"
                />
              </div>
              <div>
                <strong class="d-block fw-semibold small"
                  >A world of stories, one place.</strong
                ><span class="d-block text-body-secondary mt-0 small"
                  >Your next great read starts here.</span
                >
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div
            class="hero-visual position-relative d-flex align-items-center justify-content-center"
            aria-label="Featured books from the Folio collection"
          >
            <div
              class="hero-orbit orbit-one position-absolute border rounded-circle"
            ></div>
            <div
              class="hero-orbit orbit-two position-absolute border rounded-circle"
            ></div>
            <span
              class="hero-star star-one position-absolute text-body-secondary"
              >✳</span
            ><span class="hero-star star-two position-absolute">✧</span
            ><span
              class="hero-visual-note position-absolute fst-italic text-body-secondary fs-5"
              >a story for every shelf</span
            >
            <div class="hero-book-stack position-relative mt-2">
              <RouterLink
                v-for="(book, index) in featured"
                :key="book.id"
                :to="`/books/${book.id}`"
                class="hero-book text-decoration-none position-absolute"
                :class="`hero-book-${index}`"
                :aria-label="`Discover ${book.title}`"
                ><BookCover
                  :book="book"
                  :author="authorMap[book.authorId]?.name"
                  illustrated
              /></RouterLink>
              <div
                v-if="!featured.length"
                class="hero-placeholder d-flex h-100 flex-column align-items-center justify-content-center gap-3 text-body-secondary fs-2"
              >
                <AppIcon name="book" :size="90" /><span>One more chapter.</span>
              </div>
            </div>
            <span
              class="hero-stamp position-absolute d-flex align-items-center gap-2 border rounded-1 py-2 px-3 bg-body-tertiary"
              ><AppIcon name="book" :size="20" /><span class="small"
                >GOOD BOOKS.<br />GREAT COMPANY.</span
              ></span
            >
          </div>
        </div>
      </div>
    </div>
  </section>
  <div class="collection-strip border-top border-bottom">
    <div
      class="container d-flex justify-content-center justify-content-md-between align-items-center py-3 px-4"
    >
      <span class="d-flex align-items-center"
        ><AppIcon name="book" :size="17" />
        {{ loading ? 'Curated' : bookStore.books.length }} books to get lost
        in</span
      ><span class="strip-divider small">✦</span
      ><span class="d-flex align-items-center"
        ><AppIcon name="users" :size="17" />
        {{ loading ? 'Inspiring' : authorStore.authors.length }} voices worth
        knowing</span
      ><span class="strip-divider small">✦</span
      ><span class="d-flex align-items-center"
        ><AppIcon name="globe" :size="17" /> Endless new perspectives</span
      >
    </div>
  </div>
  <section class="section-space container px-4 py-5">
    <div
      class="section-heading d-flex justify-content-between align-items-end gap-3 mb-4"
    >
      <div>
        <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
          YOUR NEXT CHAPTER
        </p>
        <h2 class="fw-normal mb-2">
          Fresh on the shelf<span class="accent-dot">.</span>
        </h2>
        <p class="text-body-secondary m-0">
          A few recent additions. A thousand places to go.
        </p>
      </div>
      <RouterLink
        to="/books"
        class="text-link text-decoration-none d-inline-flex align-items-center gap-1 gap-md-2 fw-semibold border-0 bg-transparent mb-1 p-0"
        >View all books <AppIcon class="flex-shrink-0" name="arrow" :size="18"
      /></RouterLink>
    </div>
    <DataState
      :loading="loading"
      :error="error"
      :empty="!recentBooks.length"
      title="The shelf is waiting"
      description="Our next stories will appear here. Check back soon."
      @retry="load"
      ><div class="row g-4">
        <div v-for="book in recentBooks" :key="book.id" class="col-6 col-lg-3">
          <BookCard :book="book" :author="authorMap[book.authorId]" />
        </div></div
    ></DataState>
  </section>
  <section class="genres-section px-0 py-4 bg-body-tertiary">
    <div class="container px-4">
      <div class="genres-inner row align-items-center g-4">
        <div class="col-md-5">
          <div>
            <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
              FOLLOW YOUR CURIOSITY
            </p>
            <h2 class="fw-normal m-0 fs-3">What’s your kind of story?</h2>
          </div>
        </div>
        <div class="col-md-7">
          <div
            class="genre-chips d-flex flex-wrap gap-2 justify-content-start justify-content-md-end"
          >
            <RouterLink
              v-for="genre in genres.slice(0, 8)"
              :key="genre"
              :to="{ path: '/books', query: { genre } }"
              class="genre-chip text-decoration-none border rounded-pill d-flex align-items-center gap-2 text-capitalize p-2 px-md-3 small"
              >{{ genre }}
              <AppIcon
                class="flex-shrink-0"
                name="arrow"
                :size="15" /></RouterLink
            ><RouterLink
              v-if="!genres.length"
              to="/books"
              class="genre-chip text-decoration-none border rounded-pill d-flex align-items-center gap-2 text-capitalize p-2 px-md-3 small"
              >Browse the collection
              <AppIcon class="flex-shrink-0" name="arrow" :size="15"
            /></RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="section-space container px-4 py-5">
    <div
      class="section-heading centered d-block justify-content-between align-items-end gap-3 mb-5 text-center"
    >
      <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
        MORE THAN A BOOKSHELF
      </p>
      <h2 class="fw-normal mb-2">A space for the curious.</h2>
      <p class="text-body-secondary m-0">
        Good books open doors. We help you find yours.
      </p>
    </div>
    <div class="row g-4 feature-row">
      <div
        v-for="(feature, index) in features"
        :key="feature.title"
        class="col-md-4"
      >
        <article
          class="feature-card position-relative pe-md-4 pb-md-0 py-2 px-3"
          :class="index ? 'ps-md-4' : 'ps-md-0'"
        >
          <span class="feature-number position-absolute">0{{ index + 1 }}</span
          ><span
            class="feature-icon rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
            ><AppIcon :name="feature.icon" :size="26"
          /></span>
          <h3 class="fw-normal mb-3 fs-4">{{ feature.title }}</h3>
          <p class="mt-0 text-body-secondary mx-0 small">{{ feature.text }}</p>
        </article>
      </div>
    </div>
  </section>
  <section class="container section-bottom pb-5 px-4">
    <div
      class="home-cta position-relative overflow-hidden bg-primary rounded-2 d-flex justify-content-between gap-4 p-4 p-lg-5"
    >
      <div>
        <p class="eyebrow mt-0 mb-3 d-block fw-bold mx-0 small">
          MAKE ROOM FOR GOOD STORIES
        </p>
        <h2 class="fw-normal">Your library. Your next chapter.</h2>
        <p class="mt-3 mb-4 mx-0 small">
          Bring your books and favorite authors together in one thoughtful
          space.
        </p>
        <RouterLink
          to="/admin"
          class="btn btn-cream text-decoration-none d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
          >Manage the library
          <AppIcon class="flex-shrink-0" name="arrow" :size="18"
        /></RouterLink>
      </div>
      <div
        class="cta-art d-none d-md-flex gap-3 align-items-center pe-0 pe-xl-4"
        aria-hidden="true"
      >
        <AppIcon name="book" :size="110" /><span class="fs-3"
          >the story<br /><em>continues.</em></span
        >
      </div>
    </div>
  </section>
</template>
