<template>
  <div class="card h-100">
    <div class="card-body d-flex flex-column">
      <div class="d-flex align-items-center mb-3">
        <div class="avatar me-3">{{ initial }}</div>

        <div>
          <h5 class="mb-0">{{ author.name }}</h5>
          <p class="eyebrow mb-0">{{ bookCount }}</p>
        </div>
      </div>

      <p class="text-muted small">{{ shortBio }}</p>

      <RouterLink :to="`/authors/${author.id}`" class="btn btn-outline-secondary btn-sm mt-auto">
        View Details
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  author: {
    type: Object,
    required: true,
  },
  books: {
    type: Number,
    default: 0,
  },
});

const initial = computed(() => props.author.name.charAt(0).toUpperCase());

const bookCount = computed(() =>
  props.books === 1 ? "1 book" : `${props.books} books`
);

const shortBio = computed(() => {
  if (!props.author.bio) return "No biography yet.";
  if (props.author.bio.length <= 120) return props.author.bio;
  return props.author.bio.slice(0, 120) + "...";
});
</script>

<style scoped>
.avatar {
  width: 46px;
  height: 46px;
  font-size: 1.2rem;
}
</style>
