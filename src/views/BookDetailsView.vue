<template>
  <div v-if="selectedLoading" class="text-center py-5">
    <div class="spinner-border" role="status"></div>
  </div>

  <div v-else-if="selectedError" class="alert alert-danger">
    Something went wrong while loading this book.
  </div>

  <div v-else-if="selectedBook">
    <div class="row g-5">
      <div class="col-md-4">
        <div class="book-art">
          <img :src="selectedBook.coverUrl" :alt="selectedBook.title" class="book-cover" />
        </div>
      </div>

      <div class="col-md-8">
        <p class="eyebrow mb-2">Published {{ selectedBook.year }}</p>

        <h1 class="mb-3">{{ selectedBook.title }}</h1>

        <p class="text-muted mb-4">
          By
          <RouterLink v-if="author" :to="`/authors/${author.id}`">{{ author.name }}</RouterLink>
          <span v-else>an unknown author</span>
        </p>

        <div class="mb-4">
          <span class="tag" v-for="tag in selectedBook.tags" :key="tag">{{ tag }}</span>
        </div>

        <p class="mb-4">{{ selectedBook.description }}</p>

        <RouterLink to="/books" class="btn btn-outline-secondary">Back to Books</RouterLink>
      </div>
    </div>
  </div>

  <div v-else class="alert alert-secondary">Book not found.</div>

  <ChatWidget
    v-if="selectedBook"
    entity-type="book"
    :entity-id="selectedBook.id"
    :name="selectedBook.title"
  />
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import ChatWidget from "../components/ChatWidget.vue";
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

<style scoped>
.book-art {
  background: #f0e8ea;
  border: 1px solid #e8dfe1;
  border-radius: 6px;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover {
  max-width: 100%;
  box-shadow: 6px 8px 15px #2a1f221e;
  border-radius: 1px 3px 3px 1px;
}
</style>
