<script setup>
import AuthorAvatar from './AuthorAvatar.vue'
import AppIcon from './AppIcon.vue'
defineProps({ author: { type: Object, required: true }, count: { type: Number, default: 0 } })
</script>

<template>
  <article class="author-card">
    <AuthorAvatar :author="author" /><span class="eyebrow">BEHIND THE PAGES</span>
    <h3>
      <RouterLink :to="`/authors/${author.id}`">{{ author.name }}</RouterLink>
    </h3>
    <p>
      {{
        author.bio ||
        'There is a story behind every storyteller. Explore their work in the collection.'
      }}
    </p>
    <RouterLink :to="`/authors/${author.id}`" class="text-link"
      >{{ count }} {{ count === 1 ? 'book' : 'books' }} in the collection
      <AppIcon name="arrow" :size="18"
    /></RouterLink>
  </article>
</template>
