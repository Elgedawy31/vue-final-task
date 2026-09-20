<template>
  <div v-if="selectedLoading" class="text-center py-5">
    <div class="spinner-border" role="status"></div>
  </div>

  <div v-else-if="selectedError" class="alert alert-danger">
    Something went wrong while loading this book.
  </div>

  <div v-else-if="selectedBook" class="row g-4">
    <div class="col-md-4">
      <img :src="selectedBook.coverUrl" :alt="selectedBook.title" class="img-fluid rounded border" />
    </div>

    <div class="col-md-8">
      <h2>{{ selectedBook.title }}</h2>

      <p class="text-muted">
        <RouterLink v-if="author" :to="`/authors/${author.id}`">{{ author.name }}</RouterLink>
        <span v-else>Unknown author</span>
        &middot; {{ selectedBook.year }}
      </p>

      <div class="mb-3">
        <span class="tag" v-for="tag in selectedBook.tags" :key="tag">{{ tag }}</span>
      </div>

      <p>{{ selectedBook.description }}</p>

      <RouterLink to="/books" class="btn btn-outline-primary">Back to Books</RouterLink>
    </div>
  </div>

  <div v-else class="alert alert-secondary">Book not found.</div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useBookStore } from "../stores/book.js";
import { useAuthorStore } from "../stores/author.js";

const route = useRoute();
const bookStore = useBookStore();
const authorStore = useAuthorStore();

const { selectedBook, selectedLoading, selectedError } = storeToRefs(bookStore);
const { authors } = storeToRefs(authorStore);
const { getBookById } = bookStore;
const { getAllAuthors } = authorStore;

const author = computed(() => {
  if (!selectedBook.value) return null;
  return authors.value.find((a) => a.id === selectedBook.value.authorId);
});

const loadData = async () => {
  await getBookById(route.params.id);
  if (authors.value.length === 0) {
    await getAllAuthors();
  }
};

onMounted(loadData);

watch(() => route.params.id, loadData);
</script>
