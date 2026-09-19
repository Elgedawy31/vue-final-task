<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './auth.js'
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'
import AppIcon from './AppIcon.vue'
const route = useRoute()
const auth = useAuthStore()
const isAdmin = computed(() => !!route.meta.requiresAuth)
</script>

<template>
<a href="#main-content" class="skip-link">Skip to content</a>
<Navbar v-if="!isAdmin" />
<main id="main-content" tabindex="-1">
  <RouterView :key="route.path" />
</main>
<Footer v-if="!isAdmin" />
<div class="toast-stack" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast"
      ><div
        v-for="message in auth.messages"
        :key="message.id"
        class="app-toast"
        :class="message.type"
        :role="message.type === 'error' ? 'alert' : 'status'"
      >
        <AppIcon :name="message.type === 'error' ? 'alert' : 'check'" /><span>{{
          message.text
        }}</span
        ><button
          class="icon-button"
          aria-label="Dismiss notification"
          @click="auth.dismiss(message.id)"
        >
          <AppIcon name="close" :size="16" />
        </button></div
    ></TransitionGroup>
  </div>
</template>
