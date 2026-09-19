<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCatalog } from '../composables/useCatalog'
import PageHeading from '../components/PageHeading.vue'
import DataState from '../components/DataState.vue'
import AuthorCard from '../components/AuthorCard.vue'
import AppIcon from '../components/AppIcon.vue'
const { authors, books, loading, error, load } = useCatalog()
const search = ref('')
const filtered = computed(() =>
  authors.items.filter((author) =>
    author.name.toLowerCase().includes(search.value.trim().toLowerCase()),
  ),
)
const counts = computed(() =>
  books.items.reduce((result, book) => {
    result[book.authorId] = (result[book.authorId] || 0) + 1
    return result
  }, {}),
)
onMounted(load)
</script>

<template>
  <div class="container page-space">
    <PageHeading
      eyebrow="THE STORYTELLERS"
      title="Meet the minds behind the pages."
      description="Different voices. Remarkable imaginations. Stories that bring us together."
    />
    <div class="authors-toolbar">
      <div class="search-field">
        <AppIcon name="search" /><label for="author-search" class="visually-hidden"
          >Search authors by name</label
        ><input
          id="author-search"
          v-model="search"
          type="search"
          class="form-control"
          placeholder="Find an author…"
        />
      </div>
      <span class="muted"
        >{{ filtered.length }} {{ filtered.length === 1 ? 'storyteller' : 'storytellers' }} in the
        collection</span
      >
    </div>
    <DataState
      :loading="loading"
      :error="error"
      :empty="!filtered.length"
      title="No authors found"
      description="Try a different name. There are more voices to discover."
      @retry="load"
      ><template #empty
        ><button v-if="search" class="btn btn-outline-primary" @click="search = ''">
          Clear search
        </button></template
      >
      <div class="row g-4">
        <div v-for="author in filtered" :key="author.id" class="col-md-6 col-lg-4">
          <AuthorCard :author="author" :count="counts[author.id] || 0" />
        </div></div
    ></DataState>
  </div>
</template>
