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
  <header class="site-header bg-body border-bottom">
    <nav
      class="container site-nav h-100 d-flex align-items-center justify-content-between px-4"
      aria-label="Main navigation"
    >
      <RouterLink
        to="/"
        class="brand text-decoration-none d-inline-flex align-items-center gap-2"
        aria-label="Folio home"
        ><span class="brand-icon text-primary d-flex align-items-center"
          ><AppIcon class="flex-shrink-0" name="book" :size="25"
        /></span>
        folio<span class="brand-dot">.</span></RouterLink
      >
      <button
        class="icon-button nav-toggle d-flex d-md-none align-items-center justify-content-center border-0 rounded-1 p-2"
        :aria-expanded="open"
        aria-controls="main-nav-links"
        aria-label="Toggle navigation"
        @click="open = !open"
      >
        <AppIcon class="flex-shrink-0" :name="open ? 'close' : 'menu'" />
      </button>
      <div id="main-nav-links" class="nav-links" :class="{ 'is-open': open }">
        <RouterLink
          class="text-decoration-none position-relative small"
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :exact-active-class="'is-active'"
          >{{ link.label }}</RouterLink
        >
        <RouterLink
          to="/admin"
          class="btn btn-primary nav-dashboard text-decoration-none d-inline-flex align-items-center justify-content-center gap-2 rounded-1 shadow-none ms-0 ms-lg-4 py-2 px-3 small"
          ><AppIcon class="flex-shrink-0" name="grid" :size="16" /> Dashboard
          <AppIcon class="flex-shrink-0" name="arrow" :size="16"
        /></RouterLink>
      </div>
    </nav>
  </header>
</template>
