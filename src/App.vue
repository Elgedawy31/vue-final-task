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
  <a
    href="#main-content"
    class="skip-link text-decoration-none position-fixed bg-primary rounded-1 py-2 px-3"
    >Skip to content</a
  >
  <Navbar v-if="!isAdmin" />
  <main id="main-content" tabindex="-1">
    <RouterView :key="route.path" />
  </main>
  <Footer v-if="!isAdmin" />
  <div
    class="toast-stack position-fixed d-flex flex-column gap-2"
    aria-live="polite"
    aria-atomic="false"
  >
    <TransitionGroup name="toast"
      ><div
        v-for="message in auth.messages"
        :key="message.id"
        class="app-toast align-items-center gap-2 pe-2 ps-3 border rounded-2 py-3 small"
        :class="message.type"
        :role="message.type === 'error' ? 'alert' : 'status'"
      >
        <AppIcon
          class="flex-shrink-0"
          :name="message.type === 'error' ? 'alert' : 'check'"
        /><span>{{ message.text }}</span
        ><button
          class="icon-button d-inline-flex align-items-center justify-content-center border-0 rounded-1 p-2"
          aria-label="Dismiss notification"
          @click="auth.dismiss(message.id)"
        >
          <AppIcon class="flex-shrink-0" name="close" :size="16" />
        </button></div
    ></TransitionGroup>
  </div>
</template>
