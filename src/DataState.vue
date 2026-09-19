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
  <div v-if="loading" class="loading-state" role="status" aria-live="polite">
    <span class="spinner-border spinner-border-sm"></span><span>Opening the next chapter…</span>
    <div class="skeleton-row" aria-hidden="true">
      <div v-for="n in 4" :key="n" class="skeleton-card"></div>
    </div>
  </div>
  <div v-else-if="error" class="empty-state" role="alert">
    <span class="state-icon"><AppIcon name="alert" :size="28" /></span>
    <h2>Something interrupted the story</h2>
    <p>{{ error }}</p>
    <button class="btn btn-primary" @click="$emit('retry')">
      <AppIcon name="refresh" :size="16" /> Try again
    </button>
  </div>
  <div v-else-if="empty" class="empty-state">
    <span class="state-icon"><AppIcon name="book" :size="28" /></span>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <slot name="empty" />
  </div>
  <slot v-else />
</template>
