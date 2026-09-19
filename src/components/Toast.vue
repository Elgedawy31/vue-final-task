<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      v-if="message"
      class="toast show text-white"
      :class="type === 'success' ? 'bg-success' : 'bg-danger'"
      role="alert"
    >
      <div class="toast-body">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useToastStore } from "../stores/toast.js";

const toastStore = useToastStore();
const { message, type } = storeToRefs(toastStore);
</script>
