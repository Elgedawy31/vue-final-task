<template>
  <!-- Hero -->
  <div class="p-5 bg-white border rounded text-center mb-4">
    <h1>Books & Authors</h1>
    <p class="text-muted">Browse a small library of books and the people who wrote them.</p>

    <RouterLink to="/books" class="btn btn-primary me-2">Browse Books</RouterLink>
    <RouterLink to="/about" class="btn btn-outline-secondary">About</RouterLink>
  </div>

  <!-- Features -->
  <div class="row g-3 mb-5">
    <div class="col-md-4" v-for="feature in features" :key="feature.title">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">{{ feature.title }}</h5>
          <p class="card-text text-muted">{{ feature.text }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent books -->
  <h3 class="mb-3">Recent Books</h3>

  <DataState
    :loading="loading"
    :error="error"
    :empty="recentBooks.length === 0"
    empty-text="No books yet."
    @retry="loadData"
  >
    <div class="row g-3">
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
  { title: "Find a book", text: "Search the catalogue by title or filter by author." },
  { title: "Meet the authors", text: "Read short biographies and see what each author wrote." },
  { title: "Manage the library", text: "Add, edit, and remove books and authors from the admin area." },
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
