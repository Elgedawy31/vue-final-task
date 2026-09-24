<template>
  <div class="hero p-5 mb-5">
    <div class="row align-items-center g-4">
      <div class="col-lg-7">
        <p class="eyebrow mb-3">A small library</p>

        <h1 class="mb-3">Find your next good book.</h1>

        <p class="text-muted mb-4" style="max-width: 460px">
          Browse a collection of books and the people who wrote them. Search by title,
          explore an author, and keep the shelves in order from the admin area.
        </p>

        <RouterLink to="/books" class="btn btn-primary me-2">Browse Books</RouterLink>
        <RouterLink to="/authors" class="btn btn-outline-secondary">Meet the Authors</RouterLink>
      </div>

      <div class="col-lg-5 d-none d-lg-block">
        <div class="hero-counts">
          <div class="mb-4">
            <div class="stat-number">{{ books.length }}</div>
            <p class="eyebrow mb-0">Books on the shelf</p>
          </div>

          <div>
            <div class="stat-number">{{ authors.length }}</div>
            <p class="eyebrow mb-0">Authors</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="features mb-5">
    <div class="row g-0">
      <div class="col-6 col-lg-3" v-for="stat in stats" :key="stat.label">
        <div class="stat-cell h-100">
          <div class="stat-value">{{ stat.value }}</div>
          <p class="eyebrow mb-0">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <div class="genre-bar">
      <p class="eyebrow mb-0 me-1">Browse by genre</p>

      <RouterLink
        v-for="genre in topGenres"
        :key="genre.name"
        :to="`/books?tag=${encodeURIComponent(genre.name)}`"
        class="genre-pill"
      >
        {{ genre.name }}
        <span class="genre-count">{{ genre.count }}</span>
      </RouterLink>

      <RouterLink to="/books" class="genre-pill genre-all">All books</RouterLink>
    </div>
  </div>

  <div class="d-flex justify-content-between align-items-end mb-4">
    <div>
      <p class="eyebrow mb-2">Latest additions</p>
      <h2 class="mb-0">Recent Books</h2>
    </div>

    <RouterLink to="/books" class="btn btn-outline-secondary btn-sm">View all</RouterLink>
  </div>

  <DataState
    :loading="loading"
    :error="error"
    :empty="recentBooks.length === 0"
    empty-text="No books yet."
    @retry="loadData"
  >
    <div class="row g-4">
      <div class="col-12 col-sm-6 col-lg-3" v-for="book in recentBooks" :key="book.id">
        <BookCard :book="book" :author-name="getAuthorName(book.authorId)" />
      </div>
    </div>
  </DataState>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import BookCard from "../components/BookCard.vue";
import DataState from "../components/DataState.vue";
import { useBookStore } from "../stores/book.js";
import { useAuthorStore } from "../stores/author.js";

const bookStore = useBookStore();
const authorStore = useAuthorStore();

const { books, loading, error } = storeToRefs(bookStore);
const { authors } = storeToRefs(authorStore);
const { getAllBooks } = bookStore;
const { getAllAuthors } = authorStore;

const stats = computed(() => [
  { value: books.value.length, label: "Books" },
  { value: authors.value.length, label: "Authors" },
  { value: genreCount.value, label: "Genres" },
  { value: yearSpan.value, label: "Years covered" },
]);

const tagCounts = computed(() => {
  const counts = {};
  books.value.forEach((book) => {
    (book.tags || []).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return counts;
});

const genreCount = computed(() => Object.keys(tagCounts.value).length);

const topGenres = computed(() =>
  Object.keys(tagCounts.value)
    .map((name) => ({ name, count: tagCounts.value[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
);

const yearSpan = computed(() => {
  const years = books.value.map((book) => book.year).filter(Boolean);
  if (years.length === 0) return 0;
  return Math.max(...years) - Math.min(...years);
});

const recentBooks = computed(() => books.value.slice(0, 4));

const getAuthorName = (authorId) => {
  const author = authors.value.find((a) => a.id === authorId);
  return author ? author.name : "Unknown author";
};

const loadData = async () => {
  await getAllBooks();
  await getAllAuthors();
};

onMounted(loadData);
</script>

<style scoped>
.features {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
}

.stat-cell {
  padding: 22px 26px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.col-lg-3:last-child .stat-cell {
  border-right: 0;
}

.stat-value {
  font-family: var(--serif);
  font-size: 34px;
  line-height: 1.1;
  color: var(--wine);
}

.genre-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 18px 26px;
}

.genre-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 13px;
  border: 1px solid var(--line);
  border-radius: 20px;
  font-size: 13px;
  color: var(--ink);
  text-decoration: none;
  text-transform: capitalize;
}

.genre-pill:hover {
  background: var(--cream);
  border-color: #d3c0c5;
  color: var(--wine);
}

.genre-count {
  color: var(--muted);
  font-size: 12px;
}

.genre-all {
  background: var(--cream);
}

@media (max-width: 991.98px) {
  .col-6:nth-child(even) .stat-cell {
    border-right: 0;
  }
}

.hero-counts {
  border-left: 1px solid #e0d3d7;
  padding-left: 40px;
}
</style>
