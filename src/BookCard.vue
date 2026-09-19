<script setup>
import BookCover from './BookCover.vue'
import AppIcon from './AppIcon.vue'
defineProps({ book: { type: Object, required: true }, author: Object })
</script>

<template>
  <article class="book-card">
    <RouterLink
      :to="`/books/${book.id}`"
      class="book-card-art text-decoration-none d-flex position-relative align-items-center justify-content-center rounded-1 overflow-hidden"
      :aria-label="`Explore ${book.title}`"
      ><BookCover :book="book" :author="author?.name" /><span
        class="book-card-arrow position-absolute bg-body d-none d-md-flex justify-content-center align-items-center rounded-circle"
        ><AppIcon class="flex-shrink-0" name="arrow" :size="19" /></span
    ></RouterLink>
    <div
      class="book-card-meta d-flex justify-content-between align-items-center mt-md-3 text-body-secondary my-2 small"
    >
      <span class="genre-label text-uppercase fw-semibold">{{
        book.tags[0] || 'Literature'
      }}</span
      ><span>{{ book.year }}</span>
    </div>
    <h3 class="fw-normal mb-1">
      <RouterLink class="text-decoration-none" :to="`/books/${book.id}`">{{
        book.title
      }}</RouterLink>
    </h3>
    <RouterLink
      v-if="author"
      :to="`/authors/${author.id}`"
      class="book-card-author text-decoration-none small"
      >{{ author.name }}</RouterLink
    ><span v-else class="book-card-author text-body-secondary small"
      >Author unavailable</span
    >
  </article>
</template>
