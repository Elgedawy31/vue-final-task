<template>
  <h2 class="mb-4">Authors</h2>

  <div class="mb-4 bg-white border rounded p-3">
    <label class="form-label" for="search">Search by name</label>
    <input id="search" type="text" class="form-control" v-model="search" placeholder="Author name" />
  </div>

  <DataState
    :loading="loading"
    :error="error"
    :empty="filteredAuthors.length === 0"
    empty-text="No authors match your search."
    @retry="getAllAuthors"
  >
    <div class="row g-3">
      <div class="col-12 col-sm-6 col-lg-4" v-for="author in filteredAuthors" :key="author.id">
        <AuthorCard :author="author" />
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

const authorStore = useAuthorStore();

const { authors, loading, error } = storeToRefs(authorStore);
const { getAllAuthors } = authorStore;

const search = ref("");

const filteredAuthors = computed(() =>
  authors.value.filter((author) =>
    author.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

onMounted(getAllAuthors);
</script>
