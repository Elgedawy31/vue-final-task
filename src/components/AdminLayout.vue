<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppIcon from './AppIcon.vue'
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const open = ref(false)
const section = computed(() =>
  route.path.includes('/books')
    ? 'Books'
    : route.path.includes('/authors')
      ? 'Authors'
      : 'Overview',
)
const links = [
  { to: '/admin', label: 'Overview', icon: 'grid' },
  { to: '/admin/books', label: 'Books', icon: 'book' },
  { to: '/admin/authors', label: 'Authors', icon: 'users' },
]
watch(
  () => route.path,
  () => {
    open.value = false
  },
)
function isActive(path) {
  return path === '/admin' ? route.path === path : route.path.startsWith(path)
}
function logout() {
  auth.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar" :class="{ 'is-open': open }">
      <RouterLink to="/" class="brand"
        ><span class="brand-icon"><AppIcon name="book" :size="25" /></span> folio<span
          class="brand-dot"
          >.</span
        ></RouterLink
      >
      <p class="sidebar-label">YOUR WORKSPACE</p>
      <nav aria-label="Dashboard navigation">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="{ 'is-active': isActive(link.to) }"
          ><AppIcon :name="link.icon" :size="19" /> {{ link.label }}</RouterLink
        >
      </nav>
      <div class="sidebar-bottom">
        <div class="sidebar-tip">
          <AppIcon name="leaf" :size="26" />
          <p>A well-kept library.<br />A world of possibility.</p>
        </div>
        <RouterLink to="/" class="sidebar-link"
          ><AppIcon name="globe" :size="18" /> View public site
          <AppIcon name="arrow" :size="16" /></RouterLink
        ><button class="sidebar-link" @click="logout">
          <AppIcon name="logout" :size="18" /> Sign out
        </button>
      </div>
    </aside>
    <button
      v-if="open"
      class="sidebar-backdrop"
      aria-label="Close dashboard menu"
      @click="open = false"
    ></button>
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="d-flex align-items-center gap-3">
          <button
            class="icon-button admin-menu-toggle"
            aria-label="Toggle dashboard menu"
            :aria-expanded="open"
            @click="open = !open"
          >
            <AppIcon name="menu" /></button
          ><span class="muted">Workspace</span><AppIcon name="chevron" :size="14" /><span>{{
            section
          }}</span>
        </div>
        <div class="admin-user">
          <span class="user-avatar">A</span>
          <div><strong>Library admin</strong><span>Folio workspace</span></div>
        </div>
      </header>
      <main id="main-content" class="admin-content" tabindex="-1">
        <RouterView :key="$route.path" />
      </main>
      <footer class="admin-footer">
        Folio library workspace <span>One good story at a time.</span>
      </footer>
    </div>
  </div>
</template>
