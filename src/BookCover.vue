<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({
  book: { type: Object, required: true },
  author: { type: String, default: '' },
  illustrated: Boolean,
})
const failed = ref(false)
const theme = computed(() => coverTheme(props.book.title))
watch(
  () => props.book.coverUrl,
  () => {
    failed.value = false
  },
)
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
  <div class="book-cover" :class="`cover-${theme}`">
    <div class="cover-art" aria-hidden="true">
      <span class="cover-edition">THE FOLIO COLLECTION</span
      ><span class="cover-title">{{ book.title }}</span>
      <div class="cover-shape"><span></span><span></span><span></span></div>
      <span class="cover-author">{{ author }}</span>
    </div>
    <img
      v-if="book.coverUrl && !failed && !illustrated"
      :src="book.coverUrl"
      :alt="`${book.title} cover`"
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="failed = true"
    />
  </div>
</template>
