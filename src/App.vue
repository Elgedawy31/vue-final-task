<script setup>
import ToastStack from './components/ToastStack.vue'
</script>

<template>
  <a href="#main-content" class="skip-link">Skip to content</a><RouterView /><ToastStack />
</template>
