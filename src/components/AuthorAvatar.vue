<script setup>
import { computed, ref, watch } from 'vue'
import { initials, coverTheme } from '../helpers'
const props = defineProps({ author: { type: Object, required: true } })
const failed = ref(false)
const letters = computed(() => initials(props.author.name))
const theme = computed(() => coverTheme(props.author.name))
watch(
  () => props.author.avatarUrl,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <div class="author-avatar" :class="`cover-${theme}`">
    <img
      v-if="author.avatarUrl && !failed"
      :src="author.avatarUrl"
      :alt="author.name"
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="failed = true"
    /><span v-else aria-hidden="true">{{ letters }}</span>
  </div>
</template>
