<template>
  <div class="card h-100">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ author.name }}</h5>

      <p class="text-muted small">{{ shortBio }}</p>

      <RouterLink :to="`/authors/${author.id}`" class="btn btn-primary mt-auto">
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
});

const shortBio = computed(() => {
  if (!props.author.bio) return "No biography yet.";
  if (props.author.bio.length <= 120) return props.author.bio;
  return props.author.bio.slice(0, 120) + "...";
});
</script>
