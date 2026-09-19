<template>
  <h2 class="mb-4">Dashboard</h2>

  <div class="row g-3 mb-4">
    <div class="col-md-6">
      <div class="card text-center">
        <div class="card-body">
          <h1 class="mb-0">{{ books.length }}</h1>
          <p class="text-muted mb-0">Books</p>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card text-center">
        <div class="card-body">
          <h1 class="mb-0">{{ authors.length }}</h1>
          <p class="text-muted mb-0">Authors</p>
        </div>
      </div>
    </div>
  </div>

  <RouterLink to="/admin/books" class="btn btn-primary me-2">Manage Books</RouterLink>
  <RouterLink to="/admin/authors" class="btn btn-primary">Manage Authors</RouterLink>
</template>

<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useBookStore } from "../stores/book.js";
import { useAuthorStore } from "../stores/author.js";

const bookStore = useBookStore();
const authorStore = useAuthorStore();

const { books } = storeToRefs(bookStore);
const { authors } = storeToRefs(authorStore);
const { getAllBooks } = bookStore;
const { getAllAuthors } = authorStore;

onMounted(async () => {
  await getAllBooks();
  await getAllAuthors();
});
</script>
