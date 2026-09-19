<script setup>
import { computed, onMounted } from 'vue'
import { useCatalog } from '../composables/useCatalog'
import AppIcon from '../components/AppIcon.vue'
import BookCover from '../components/BookCover.vue'
import BookCard from '../components/BookCard.vue'
import DataState from '../components/DataState.vue'
import AuthorAvatar from '../components/AuthorAvatar.vue'
const { books, authors, authorMap, recentBooks, genres, loading, error, load } = useCatalog()
const featured = computed(() => books.items.slice(0, 3))
const featuredAuthors = computed(() => authors.items.slice(0, 4))
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
  <section class="home-hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow"><span class="small-line"></span> FOR THE LOVE OF READING</p>
        <h1>A little curiosity.<br />A whole new <em>chapter.</em></h1>
        <p class="hero-description">
          Discover stories that stay with you.<br class="desktop-break" />
          Meet the authors who make them possible.
        </p>
        <div class="hero-actions">
          <RouterLink to="/books" class="btn btn-primary"
            >Explore the collection <AppIcon name="arrow" :size="18" /></RouterLink
          ><RouterLink to="/about" class="text-link"
            >Our story <AppIcon name="arrow" :size="17"
          /></RouterLink>
        </div>
        <div class="hero-proof">
          <div class="avatar-stack">
            <AuthorAvatar v-for="author in featuredAuthors" :key="author.id" :author="author" />
          </div>
          <div>
            <strong>A world of stories, one place.</strong
            ><span>Your next great read starts here.</span>
          </div>
        </div>
      </div>
      <div class="hero-visual" aria-label="Featured books from the Folio collection">
        <div class="hero-orbit orbit-one"></div>
        <div class="hero-orbit orbit-two"></div>
        <span class="hero-star star-one">✳</span><span class="hero-star star-two">✧</span
        ><span class="hero-visual-note">a story for every shelf</span>
        <div class="hero-book-stack">
          <RouterLink
            v-for="(book, index) in featured"
            :key="book.id"
            :to="`/books/${book.id}`"
            class="hero-book"
            :class="`hero-book-${index}`"
            :aria-label="`Discover ${book.title}`"
            ><BookCover :book="book" :author="authorMap[book.authorId]?.name" illustrated
          /></RouterLink>
          <div v-if="!featured.length" class="hero-placeholder">
            <AppIcon name="book" :size="90" /><span>One more chapter.</span>
          </div>
        </div>
        <span class="hero-stamp"
          ><AppIcon name="book" :size="20" /><span>GOOD BOOKS.<br />GREAT COMPANY.</span></span
        >
      </div>
    </div>
  </section>
  <div class="collection-strip">
    <div class="container">
      <span
        ><AppIcon name="book" :size="17" /> {{ loading ? 'Curated' : books.items.length }} books to
        get lost in</span
      ><span class="strip-divider">✦</span
      ><span
        ><AppIcon name="users" :size="17" />
        {{ loading ? 'Inspiring' : authors.items.length }} voices worth knowing</span
      ><span class="strip-divider">✦</span
      ><span><AppIcon name="globe" :size="17" /> Endless new perspectives</span>
    </div>
  </div>
  <section class="section-space container">
    <div class="section-heading">
      <div>
        <p class="eyebrow">YOUR NEXT CHAPTER</p>
        <h2>Fresh on the shelf<span class="accent-dot">.</span></h2>
        <p>A few recent additions. A thousand places to go.</p>
      </div>
      <RouterLink to="/books" class="text-link"
        >View all books <AppIcon name="arrow" :size="18"
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
  <section class="genres-section">
    <div class="container genres-inner">
      <div>
        <p class="eyebrow">FOLLOW YOUR CURIOSITY</p>
        <h2>What’s your kind of story?</h2>
      </div>
      <div class="genre-chips">
        <RouterLink
          v-for="genre in genres.slice(0, 8)"
          :key="genre"
          :to="{ path: '/books', query: { genre } }"
          class="genre-chip"
          >{{ genre }} <AppIcon name="arrow" :size="15" /></RouterLink
        ><RouterLink v-if="!genres.length" to="/books" class="genre-chip"
          >Browse the collection <AppIcon name="arrow" :size="15"
        /></RouterLink>
      </div>
    </div>
  </section>
  <section class="section-space container">
    <div class="section-heading centered">
      <p class="eyebrow">MORE THAN A BOOKSHELF</p>
      <h2>A space for the curious.</h2>
      <p>Good books open doors. We help you find yours.</p>
    </div>
    <div class="row g-4 feature-row">
      <div v-for="(feature, index) in features" :key="feature.title" class="col-md-4">
        <article class="feature-card">
          <span class="feature-number">0{{ index + 1 }}</span
          ><span class="feature-icon"><AppIcon :name="feature.icon" :size="26" /></span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.text }}</p>
        </article>
      </div>
    </div>
  </section>
  <section class="container section-bottom">
    <div class="home-cta">
      <div>
        <p class="eyebrow">MAKE ROOM FOR GOOD STORIES</p>
        <h2>Your library. Your next chapter.</h2>
        <p>Bring your books and favorite authors together in one thoughtful space.</p>
        <RouterLink to="/admin" class="btn btn-cream"
          >Manage the library <AppIcon name="arrow" :size="18"
        /></RouterLink>
      </div>
      <div class="cta-art" aria-hidden="true">
        <AppIcon name="book" :size="110" /><span>the story<br /><em>continues.</em></span>
      </div>
    </div>
  </section>
</template>
