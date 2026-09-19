<script setup>
import AppIcon from './AppIcon.vue'
</script>

<template>
  <section class="container not-found text-center px-4">
    <p class="eyebrow mt-0 mb-3 d-block fw-bold mx-0 small">
      404 · A MISSING PAGE
    </p>
    <h1 class="fw-normal mb-3">Lost in the stacks?</h1>
    <p class="mt-0 mb-4 text-body-secondary mx-0">
      This page isn’t in our collection. Let’s find you a good story.
    </p>
    <RouterLink
      to="/"
      class="btn btn-primary text-decoration-none d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
      >Back to home <AppIcon class="flex-shrink-0" name="arrow" :size="18"
    /></RouterLink>
  </section>
</template>
