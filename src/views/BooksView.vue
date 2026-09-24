<template>
  <p class="eyebrow mb-2">The collection</p>
  <h2 class="mb-4">Books</h2>

  <!-- Search and filter -->
  <div class="card mb-4">
    <div class="card-body row g-3">
      <div class="col-md-6">
        <label class="form-label" for="search">Search by title</label>
        <input id="search" type="text" class="form-control" v-model="search" placeholder="Book title" />
      </div>

      <div class="col-md-3">
        <label class="form-label" for="author">Filter by author</label>
        <select id="author" class="form-select" v-model="selectedAuthorId">
          <option value="">All authors</option>
          <option v-for="author in authors" :key="author.id" :value="author.id">
            {{ author.name }}
          </option>
        </select>
      </div>

      <div class="col-md-3">
        <label class="form-label" for="genre">Filter by genre</label>
        <select id="genre" class="form-select" v-model="selectedTag">
          <option value="">All genres</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>
    </div>
  </div>

  <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
    <p class="text-muted small mb-0">
      Showing {{ filteredBooks.length }} of {{ books.length }} books
    </p>

    <button
      v-if="isFiltered"
      class="btn btn-outline-secondary btn-sm ms-auto"
      @click="clearFilters"
    >
      Clear filters
    </button>
  </div>

  <DataState
    :loading="loading"
    :error="error"
    :empty="filteredBooks.length === 0"
    empty-text="No books match your search."
    @retry="loadData"
  >
    <div class="row g-4">
      <div class="col-12 col-sm-6 col-lg-3" v-for="book in filteredBooks" :key="book.id">
        <BookCard :book="book" :author-name="getAuthorName(book.authorId)" />
      </div>
    </div>
  </DataState>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import BookCard from "../components/BookCard.vue";
import DataState from "../components/DataState.vue";
import { useBookStore } from "../stores/book.js";
import { useAuthorStore } from "../stores/author.js";

const route = useRoute();

const bookStore = useBookStore();
const authorStore = useAuthorStore();

const { books, loading, error } = storeToRefs(bookStore);
const { authors } = storeToRefs(authorStore);
const { getAllBooks } = bookStore;
const { getAllAuthors } = authorStore;

const search = ref("");
const selectedAuthorId = ref("");
const selectedTag = ref(route.query.tag || "");

// Every tag used in the collection, sorted and without duplicates
const allTags = computed(() => {
  const tags = new Set();
  books.value.forEach((book) => (book.tags || []).forEach((tag) => tags.add(tag)));
  return [...tags].sort();
});

const isFiltered = computed(
  () => search.value !== "" || selectedAuthorId.value !== "" || selectedTag.value !== ""
);

const clearFilters = () => {
  search.value = "";
  selectedAuthorId.value = "";
  selectedTag.value = "";
};

const filteredBooks = computed(() =>
  books.value.filter((book) => {
    const matchesTitle = book.title.toLowerCase().includes(search.value.toLowerCase());
    const matchesAuthor = selectedAuthorId.value === "" || book.authorId === selectedAuthorId.value;
    const matchesTag =
      selectedTag.value === "" || (book.tags || []).includes(selectedTag.value);
    return matchesTitle && matchesAuthor && matchesTag;
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
