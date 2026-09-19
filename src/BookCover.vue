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
  <div
    class="book-cover position-relative overflow-hidden flex-shrink-0"
    :class="`cover-${theme}`"
  >
    <div
      class="cover-art h-100 d-flex flex-column align-items-center justify-content-between text-center position-relative overflow-hidden"
      aria-hidden="true"
    >
      <span class="cover-edition border-bottom pb-1 w-100"
        >THE FOLIO COLLECTION</span
      ><span class="cover-title mw-100">{{ book.title }}</span>
      <div class="cover-shape position-relative flex-shrink-1 mx-0 my-1">
        <span class="position-absolute opacity-50"></span
        ><span class="position-absolute opacity-50"></span
        ><span class="position-absolute opacity-50"></span>
      </div>
      <span class="cover-author text-uppercase">{{ author }}</span>
    </div>
    <img
      class="position-absolute w-100 h-100 object-fit-cover"
      v-if="book.coverUrl && !failed && !illustrated"
      :src="book.coverUrl"
      :alt="`${book.title} cover`"
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="failed = true"
    />
  </div>
</template>
