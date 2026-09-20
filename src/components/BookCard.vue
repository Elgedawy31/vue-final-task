<template>
  <div class="card h-100">
    <div class="book-art">
      <img :src="book.coverUrl" :alt="book.title" class="book-cover" />
    </div>

    <div class="card-body d-flex flex-column">
      <p class="eyebrow mb-2">{{ book.year }}</p>

      <h5 class="mb-1">{{ book.title }}</h5>

      <p class="text-muted small mb-3">{{ authorName }}</p>

      <div class="mb-3">
        <span class="tag" v-for="tag in book.tags" :key="tag">{{ tag }}</span>
      </div>

      <RouterLink :to="`/books/${book.id}`" class="btn btn-outline-secondary btn-sm mt-auto">
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

<style scoped>
.book-art {
  background: #efede6;
  border-bottom: 1px solid #e4e6dc;
  padding: 24px;
  height: 230px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover {
  max-height: 100%;
  max-width: 100%;
  box-shadow: 6px 8px 15px #222b241e;
  border-radius: 1px 3px 3px 1px;
}
</style>
