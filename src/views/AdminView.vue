<template>
  <p class="eyebrow mb-2">Admin</p>
  <h2 class="mb-4">Dashboard</h2>

  <div class="row g-4 mb-5">
    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-body">
          <div class="stat-number mb-1">{{ books.length }}</div>
          <p class="eyebrow mb-3">Books</p>
          <RouterLink to="/admin/books" class="btn btn-outline-secondary btn-sm">
            Manage Books
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-body">
          <div class="stat-number mb-1">{{ authors.length }}</div>
          <p class="eyebrow mb-3">Authors</p>
          <RouterLink to="/admin/authors" class="btn btn-outline-secondary btn-sm">
            Manage Authors
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
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
