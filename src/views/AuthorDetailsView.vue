<template>
  <div v-if="selectedLoading" class="text-center py-5">
    <div class="spinner-border" role="status"></div>
  </div>

  <div v-else-if="selectedError" class="alert alert-danger">
    Something went wrong while loading this author.
  </div>

  <div v-else-if="selectedAuthor">
    <div class="hero p-5 mb-5">
      <div class="d-flex align-items-center mb-4">
        <div class="avatar me-4">{{ initial }}</div>

        <div>
          <p class="eyebrow mb-2">Author</p>
          <h1 class="mb-0">{{ selectedAuthor.name }}</h1>
        </div>
      </div>

      <p class="text-muted mb-0" style="max-width: 640px">
        {{ selectedAuthor.bio || "No biography yet." }}
      </p>
    </div>

    <p class="eyebrow mb-2">On the shelf</p>
    <h2 class="mb-4">Books by {{ selectedAuthor.name }}</h2>

    <div v-if="authorBooks.length === 0" class="alert alert-secondary">
      No books by this author yet.
    </div>

    <div v-else class="row g-4">
      <div class="col-12 col-sm-6 col-lg-3" v-for="book in authorBooks" :key="book.id">
        <BookCard :book="book" :author-name="selectedAuthor.name" />
      </div>
    </div>

    <RouterLink to="/authors" class="btn btn-outline-secondary mt-5">Back to Authors</RouterLink>
  </div>

  <div v-else class="alert alert-secondary">Author not found.</div>

  <ChatWidget
    v-if="selectedAuthor"
    entity-type="author"
    :entity-id="selectedAuthor.id"
    :name="selectedAuthor.name"
  />
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import BookCard from "../components/BookCard.vue";
import ChatWidget from "../components/ChatWidget.vue";
import { useAuthorStore } from "../stores/author.js";
import { useBookStore } from "../stores/book.js";

const route = useRoute();
const authorStore = useAuthorStore();
const bookStore = useBookStore();

const { selectedAuthor, selectedLoading, selectedError } = storeToRefs(authorStore);
const { books } = storeToRefs(bookStore);
const { getAuthorById } = authorStore;
const { getAllBooks } = bookStore;

const initial = computed(() =>
  selectedAuthor.value ? selectedAuthor.value.name.charAt(0).toUpperCase() : ""
);

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
  width: 70px;
  height: 70px;
  font-size: 29px;
}
</style>
