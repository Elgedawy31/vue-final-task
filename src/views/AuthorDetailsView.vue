<template>
  <div v-if="selectedLoading" class="text-center py-5">
    <div class="spinner-border" role="status"></div>
  </div>

  <div v-else-if="selectedError" class="alert alert-danger">
    Something went wrong while loading this author.
  </div>

  <div v-else-if="selectedAuthor">
    <div class="hero p-4 mb-4 d-flex align-items-center">
      <div class="avatar me-3">{{ selectedAuthor.name.charAt(0).toUpperCase() }}</div>
      <h2 class="mb-0">{{ selectedAuthor.name }}</h2>
    </div>

    <p class="text-muted">{{ selectedAuthor.bio }}</p>

    <h4 class="mt-4 mb-3">Books by this author</h4>

    <div v-if="authorBooks.length === 0" class="alert alert-secondary">
      No books by this author yet.
    </div>

    <div v-else class="row g-3">
      <div class="col-12 col-sm-6 col-lg-3" v-for="book in authorBooks" :key="book.id">
        <BookCard :book="book" :author-name="selectedAuthor.name" />
      </div>
    </div>

    <RouterLink to="/authors" class="btn btn-outline-primary mt-4">Back to Authors</RouterLink>
  </div>

  <div v-else class="alert alert-secondary">Author not found.</div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import BookCard from "../components/BookCard.vue";
import { useAuthorStore } from "../stores/author.js";
import { useBookStore } from "../stores/book.js";

const route = useRoute();
const authorStore = useAuthorStore();
const bookStore = useBookStore();

const { selectedAuthor, selectedLoading, selectedError } = storeToRefs(authorStore);
const { books } = storeToRefs(bookStore);
const { getAuthorById } = authorStore;
const { getAllBooks } = bookStore;

const authorBooks = computed(() => {
  if (!selectedAuthor.value) return [];
  return books.value.filter((book) => book.authorId === selectedAuthor.value.id);
});

const loadData = async () => {
  await getAuthorById(route.params.id);
  if (books.value.length === 0) {
    await getAllBooks();
  }
};

onMounted(loadData);

watch(() => route.params.id, loadData);
</script>

<style scoped>
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #3b5bdb;
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
