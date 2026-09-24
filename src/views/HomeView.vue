<template>
  <!-- Hero -->
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

  <!-- Features -->
  <div class="features mb-5">
    <div class="row g-0">
      <div
        class="col-md-4"
        v-for="(feature, index) in features"
        :key="feature.title"
      >
        <div class="feature h-100">
          <div class="d-flex align-items-baseline gap-3 mb-2">
            <span class="feature-number">0{{ index + 1 }}</span>
            <p class="eyebrow mb-0">{{ feature.label }}</p>
          </div>

          <h4 class="mb-2">{{ feature.title }}</h4>
          <p class="text-muted small mb-0">{{ feature.text }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent books -->
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

const features = [
  {
    label: "Search",
    title: "Find a book",
    text: "Search the catalogue by title or narrow the list down to a single author.",
  },
  {
    label: "Authors",
    title: "Meet the writers",
    text: "Read a short biography and see everything an author has on the shelf.",
  },
  {
    label: "Admin",
    title: "Keep it tidy",
    text: "Add, edit, and remove books and authors from the admin area.",
  },
];

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

.feature {
  padding: 28px 30px;
  border-right: 1px solid var(--line);
}

/* No divider after the last column */
.col-md-4:last-child .feature {
  border-right: 0;
}

.feature-number {
  font-family: var(--serif);
  font-size: 1.1rem;
  color: var(--wine);
}

/* Stack on small screens: dividers go horizontal */
@media (max-width: 767.98px) {
  .feature {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .col-md-4:last-child .feature {
    border-bottom: 0;
  }
}

.hero-counts {
  border-left: 1px solid #e0d3d7;
  padding-left: 2.5rem;
}
</style>
