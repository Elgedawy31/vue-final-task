<template>
  <div class="card h-100">
    <img
      :src="book.coverUrl"
      class="card-img-top"
      :alt="book.title"
      style="height: 260px; object-fit: cover"
    />

    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ book.title }}</h5>

      <p class="text-muted small mb-2">{{ authorName }} &middot; {{ book.year }}</p>

      <div class="mb-3">
        <span
          class="badge bg-light text-dark border me-1"
          v-for="tag in book.tags"
          :key="tag"
        >
          {{ tag }}
        </span>
      </div>

      <RouterLink :to="`/books/${book.id}`" class="btn btn-primary mt-auto">
        View Details
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
defineProps({
  book: {
    type: Object,
    required: true,
  },
  authorName: {
    type: String,
    default: "Unknown author",
  },
});
</script>
