<template>
  <!-- Loading -->
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border" role="status"></div>
  </div>

  <!-- Error -->
  <div v-else-if="error" class="alert alert-danger text-center">
    <p class="mb-2">Something went wrong while loading the data.</p>
    <button class="btn btn-sm btn-outline-danger" @click="emit('retry')">Retry</button>
  </div>

  <!-- Empty -->
  <div v-else-if="empty" class="alert alert-secondary text-center">
    {{ emptyText }}
  </div>

  <!-- Content -->
  <slot v-else />
</template>

<script setup>
defineProps({
  loading: Boolean,
  error: Boolean,
  empty: Boolean,
  emptyText: {
    type: String,
    default: "Nothing to show here.",
  },
});

const emit = defineEmits(["retry"]);
</script>
