<script setup>
import { useToastsStore } from '../stores/toasts'
import AppIcon from './AppIcon.vue'
const toasts = useToastsStore()
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast"
      ><div
        v-for="message in toasts.messages"
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
          @click="toasts.dismiss(message.id)"
        >
          <AppIcon name="close" :size="16" />
        </button></div
    ></TransitionGroup>
  </div>
</template>
