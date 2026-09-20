<template>
  <div class="card h-100">
    <div class="card-body d-flex flex-column">
      <div class="d-flex align-items-center mb-3">
        <div class="avatar me-3">{{ initial }}</div>
        <h5 class="card-title mb-0">{{ author.name }}</h5>
      </div>

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

const initial = computed(() => props.author.name.charAt(0).toUpperCase());

const shortBio = computed(() => {
  if (!props.author.bio) return "No biography yet.";
  if (props.author.bio.length <= 120) return props.author.bio;
  return props.author.bio.slice(0, 120) + "...";
});
</script>

<style scoped>
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #3b5bdb;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
