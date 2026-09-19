<script setup>
import AppIcon from './AppIcon.vue'
</script>

<template>
  <section class="container not-found">
    <p class="eyebrow">404 · A MISSING PAGE</p>
    <h1>Lost in the stacks?</h1>
    <p>This page isn’t in our collection. Let’s find you a good story.</p>
    <RouterLink to="/" class="btn btn-primary"
      >Back to home <AppIcon name="arrow" :size="18"
    /></RouterLink>
  </section>
</template>
