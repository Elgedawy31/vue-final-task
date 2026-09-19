<script setup>
import AppIcon from './AppIcon.vue'
defineProps({
  loading: Boolean,
  error: String,
  empty: Boolean,
  title: { type: String, default: 'Nothing here just yet' },
  description: { type: String, default: 'Try a different search or come back for something new.' },
})
defineEmits(['retry'])
</script>

<template>
  <div
    v-if="loading"
    class="loading-state text-center text-body-secondary px-0 py-4 small"
    role="status"
    aria-live="polite"
  >
    <span class="spinner-border spinner-border-sm me-2"></span
    ><span>Opening the next chapter…</span>
    <div class="row row-cols-2 row-cols-md-4 g-4 pt-4" aria-hidden="true">
      <div v-for="n in 4" :key="n" class="col">
        <div class="skeleton-card rounded-1"></div>
      </div>
    </div>
  </div>
  <div v-else-if="error" class="empty-state text-center px-4 py-5" role="alert">
    <span
      class="state-icon d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-body-secondary"
      ><AppIcon name="alert" :size="28"
    /></span>
    <h2 class="fw-normal fs-3">Something interrupted the story</h2>
    <p class="mt-2 mb-3 text-body-secondary mx-auto small">{{ error }}</p>
    <button
      class="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
      @click="$emit('retry')"
    >
      <AppIcon class="flex-shrink-0" name="refresh" :size="16" /> Try again
    </button>
  </div>
  <div v-else-if="empty" class="empty-state text-center px-4 py-5">
    <span
      class="state-icon d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-body-secondary"
      ><AppIcon name="book" :size="28"
    /></span>
    <h2 class="fw-normal fs-3">{{ title }}</h2>
    <p class="mt-2 mb-3 text-body-secondary mx-auto small">{{ description }}</p>
    <slot name="empty" />
  </div>
  <slot v-else />
</template>
