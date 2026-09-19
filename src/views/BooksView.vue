<template>
  <h2 class="mb-4">Books</h2>

  <!-- Search and filter -->
  <div class="row g-2 mb-4">
    <div class="col-md-8">
      <label class="form-label" for="search">Search by title</label>
      <input id="search" type="text" class="form-control" v-model="search" placeholder="Book title" />
    </div>

    <div class="col-md-4">
      <label class="form-label" for="author">Filter by author</label>
      <select id="author" class="form-select" v-model="selectedAuthorId">
        <option value="">All authors</option>
        <option v-for="author in authors" :key="author.id" :value="author.id">
          {{ author.name }}
        </option>
      </select>
    </div>
  </div>

  <DataState
    :loading="loading"
    :error="error"
    :empty="filteredBooks.length === 0"
    empty-text="No books match your search."
    @retry="loadData"
  >
    <div class="row g-3">
      <div class="col-12 col-sm-6 col-lg-3" v-for="book in filteredBooks" :key="book.id">
        <BookCard :book="book" :author-name="getAuthorName(book.authorId)" />
      </div>
    </div>
  </DataState>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
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

const search = ref("");
const selectedAuthorId = ref("");

const filteredBooks = computed(() =>
  books.value.filter((book) => {
    const matchesTitle = book.title.toLowerCase().includes(search.value.toLowerCase());
    const matchesAuthor = selectedAuthorId.value === "" || book.authorId === selectedAuthorId.value;
    return matchesTitle && matchesAuthor;
  })
);

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
