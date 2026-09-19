<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
const open = ref(false)
const route = useRoute()
watch(
  () => route.path,
  () => {
    open.value = false
  },
)
const links = [
  { to: '/', label: 'Home' },
  { to: '/books', label: 'Books' },
  { to: '/authors', label: 'Authors' },
  { to: '/about', label: 'Our story' },
]
</script>

<template>
  <header class="site-header">
    <nav class="container site-nav" aria-label="Main navigation">
      <RouterLink to="/" class="brand" aria-label="Folio home"
        ><span class="brand-icon"><AppIcon name="book" :size="25" /></span> folio<span
          class="brand-dot"
          >.</span
        ></RouterLink
      >
      <button
        class="icon-button nav-toggle"
        :aria-expanded="open"
        aria-controls="main-nav-links"
        aria-label="Toggle navigation"
        @click="open = !open"
      >
        <AppIcon :name="open ? 'close' : 'menu'" />
      </button>
      <div id="main-nav-links" class="nav-links" :class="{ 'is-open': open }">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :exact-active-class="'is-active'"
          >{{ link.label }}</RouterLink
        >
        <RouterLink to="/admin" class="btn btn-primary nav-dashboard"
          ><AppIcon name="grid" :size="16" /> Dashboard <AppIcon name="arrow" :size="16"
        /></RouterLink>
      </div>
    </nav>
  </header>
</template>
