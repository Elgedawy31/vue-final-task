<script setup>
import { computed, onMounted } from 'vue'
import { useCatalog } from '../../composables/useCatalog'
import { formatDate } from '../../helpers'
import PageHeading from '../../components/PageHeading.vue'
import DataState from '../../components/DataState.vue'
import BookCover from '../../components/BookCover.vue'
import AppIcon from '../../components/AppIcon.vue'
const { books, authors, authorMap, recentBooks, genres, loading, error, load } = useCatalog()
const stats = computed(() => [
  {
    label: 'Books in the collection',
    value: books.items.length,
    icon: 'book',
    link: '/admin/books',
    text: 'Manage books',
  },
  {
    label: 'Authors in the library',
    value: authors.items.length,
    icon: 'users',
    link: '/admin/authors',
    text: 'Meet your authors',
  },
  {
    label: 'Genres to explore',
    value: genres.value.length,
    icon: 'bookmark',
    link: '/books',
    text: 'Explore the collection',
  },
])
const topGenres = computed(() =>
  genres.value
    .map((name) => ({ name, count: books.items.filter((book) => book.tags.includes(name)).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((genre) => ({
      ...genre,
      width: `${books.items.length ? (genre.count / books.items.length) * 100 : 0}%`,
    })),
)
onMounted(load)
</script>

<template>
  <PageHeading
    eyebrow="YOUR LIBRARY AT A GLANCE"
    title="Welcome back, curator."
    description="A little care for the stories that matter."
    ><RouterLink to="/admin/books/new" class="btn btn-primary"
      ><AppIcon name="plus" :size="18" /> Add a book</RouterLink
    ></PageHeading
  ><DataState :loading="loading" :error="error" @retry="load"
    ><div class="row g-4 stat-row">
      <div v-for="stat in stats" :key="stat.label" class="col-md-4">
        <article class="stat-card">
          <div class="stat-label">
            {{ stat.label }}<span class="stat-icon"><AppIcon :name="stat.icon" :size="21" /></span>
          </div>
          <strong class="stat-value">{{ stat.value.toString().padStart(2, '0') }}</strong
          ><RouterLink :to="stat.link" class="text-link"
            >{{ stat.text }} <AppIcon name="arrow" :size="15"
          /></RouterLink>
        </article>
      </div>
    </div>
    <div class="row g-4">
      <div class="col-xl-8">
        <section class="admin-panel">
          <div class="panel-heading">
            <div>
              <h2>Recently added</h2>
              <p>The newest chapters in your collection.</p>
            </div>
            <RouterLink to="/admin/books" class="text-link"
              >View all <AppIcon name="arrow" :size="16"
            /></RouterLink>
          </div>
          <DataState
            :empty="!recentBooks.length"
            title="Start your collection"
            description="Add your first book to bring this shelf to life."
            ><div class="table-responsive">
              <table class="table library-table">
                <caption class="visually-hidden">
                  Recently added books
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Book</th>
                    <th scope="col">Genre</th>
                    <th scope="col">Added</th>
                    <th scope="col"><span class="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in recentBooks" :key="book.id">
                    <td>
                      <div class="table-book">
                        <BookCover :book="book" :author="authorMap[book.authorId]?.name" />
                        <div>
                          <RouterLink :to="`/books/${book.id}`" class="table-title">{{
                            book.title
                          }}</RouterLink
                          ><span>{{ authorMap[book.authorId]?.name }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="tag">{{ book.tags[0] || 'Literature' }}</span>
                    </td>
                    <td class="text-nowrap muted">{{ formatDate(book.createdAt) }}</td>
                    <td>
                      <RouterLink
                        :to="`/admin/books/${book.id}/edit`"
                        class="icon-button"
                        :aria-label="`Edit ${book.title}`"
                        ><AppIcon name="edit" :size="17"
                      /></RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table></div
          ></DataState>
        </section>
      </div>
      <div class="col-xl-4">
        <section class="admin-panel genre-panel">
          <h2>A world of genres</h2>
          <p class="muted small">The stories that fill your shelves.</p>
          <div v-for="genre in topGenres" :key="genre.name" class="genre-meter">
            <div>
              <span>{{ genre.name }}</span
              ><strong>{{ genre.count }}</strong>
            </div>
            <div class="meter-track"><span :style="{ width: genre.width }"></span></div>
          </div>
          <p v-if="!topGenres.length" class="muted">
            Add tags to your books to see your genres here.
          </p>
        </section>
      </div>
    </div>
    <section class="dashboard-note">
      <span class="feature-icon"><AppIcon name="sparkles" :size="24" /></span>
      <div>
        <h3>There’s more to every story.</h3>
        <p>Open a book or author page to explore it with the reading assistant.</p>
      </div>
      <RouterLink to="/books" class="text-link"
        >Take a look <AppIcon name="arrow" :size="17"
      /></RouterLink></section
  ></DataState>
</template>
