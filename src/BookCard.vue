<script setup>
import BookCover from './BookCover.vue'
import AppIcon from './AppIcon.vue'
defineProps({ book: { type: Object, required: true }, author: Object })
</script>

<template>
  <article class="book-card">
    <RouterLink
      :to="`/books/${book.id}`"
      class="book-card-art"
      :aria-label="`Explore ${book.title}`"
      ><BookCover :book="book" :author="author?.name" /><span class="book-card-arrow"
        ><AppIcon name="arrow" :size="19" /></span
    ></RouterLink>
    <div class="book-card-meta">
      <span class="genre-label">{{ book.tags[0] || 'Literature' }}</span
      ><span>{{ book.year }}</span>
    </div>
    <h3>
      <RouterLink :to="`/books/${book.id}`">{{ book.title }}</RouterLink>
    </h3>
    <RouterLink v-if="author" :to="`/authors/${author.id}`" class="book-card-author">{{
      author.name
    }}</RouterLink
    ><span v-else class="book-card-author">Author unavailable</span>
  </article>
</template>
