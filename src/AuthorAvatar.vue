<script setup>
import { computed, ref, watch } from 'vue'
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
function initials(name = '') {
  const words = name.trim().split(' ')
  let result = ''
  for (const word of words) {
    if (word) result += word[0]
    if (result.length === 2) break
  }
  return result
}

function coverTheme(title = '') {
  const colors = ['olive', 'rose', 'sand', 'ink', 'rust', 'sage']
  let total = 0
  for (let i = 0; i < title.length; i++) {
    total += title.charCodeAt(i)
  }
  return colors[total % colors.length]
}

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
