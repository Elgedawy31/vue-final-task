<template>
  <p class="eyebrow mb-2">The people behind the books</p>
  <h2 class="mb-4">Authors</h2>

  <div class="card mb-4">
    <div class="card-body">
      <label class="form-label" for="search">Search by name</label>
      <input id="search" type="text" class="form-control" v-model="search" placeholder="Author name" />
    </div>
  </div>

  <DataState
    :loading="loading"
    :error="error"
    :empty="filteredAuthors.length === 0"
    empty-text="No authors match your search."
    @retry="loadData"
  >
    <div class="row g-4">
      <div class="col-12 col-sm-6 col-lg-4" v-for="author in filteredAuthors" :key="author.id">
        <AuthorCard :author="author" :books="countBooks(author.id)" />
      </div>
    </div>
  </DataState>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import AuthorCard from "../components/AuthorCard.vue";
import DataState from "../components/DataState.vue";
import { useAuthorStore } from "../stores/author.js";
import { useBookStore } from "../stores/book.js";

const authorStore = useAuthorStore();
const bookStore = useBookStore();

const { authors, loading, error } = storeToRefs(authorStore);
const { books } = storeToRefs(bookStore);
const { getAllAuthors } = authorStore;
const { getAllBooks } = bookStore;

const search = ref("");

const filteredAuthors = computed(() =>
  authors.value.filter((author) =>
    author.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

const countBooks = (authorId) =>
  books.value.filter((book) => book.authorId === authorId).length;

const loadData = async () => {
  await getAllAuthors();
  await getAllBooks();
};

onMounted(loadData);
</script>
