import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './auth.js'
import HomeView from './HomeView.vue'
import BooksView from './BooksView.vue'
import AuthorsView from './AuthorsView.vue'
import AboutView from './AboutView.vue'
import LoginView from './LoginView.vue'
import AdminView from './AdminView.vue'
import NotFoundView from './NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    { path: '/', component: HomeView, meta: { title: 'Home' } },
    { path: '/books', component: BooksView, meta: { title: 'Books' } },
    { path: '/books/:id', component: BooksView, meta: { title: 'Book details' } },
    { path: '/authors', component: AuthorsView, meta: { title: 'Authors' } },
    { path: '/authors/:id', component: AuthorsView, meta: { title: 'Author details' } },
    { path: '/about', component: AboutView, meta: { title: 'Our story' } },
    { path: '/login', component: LoginView, meta: { title: 'Sign in' } },
    { path: '/admin', component: AdminView, meta: { requiresAuth: true, title: 'Dashboard' } },
    { path: '/admin/books', component: AdminView, meta: { requiresAuth: true, section: 'books', title: 'Manage books' } },
    { path: '/admin/books/new', component: AdminView, meta: { requiresAuth: true, section: 'books', form: true, title: 'Add book' } },
    { path: '/admin/books/:id/edit', component: AdminView, meta: { requiresAuth: true, section: 'books', form: true, title: 'Edit book' } },
    { path: '/admin/authors', component: AdminView, meta: { requiresAuth: true, section: 'authors', title: 'Manage authors' } },
    { path: '/admin/authors/new', component: AdminView, meta: { requiresAuth: true, section: 'authors', form: true, title: 'Add author' } },
    { path: '/admin/authors/:id/edit', component: AdminView, meta: { requiresAuth: true, section: 'authors', form: true, title: 'Edit author' } },
    { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: 'Page not found' } },
  ],
})

router.beforeEach(to => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && auth.isAuthenticated) return '/admin'
})

router.afterEach(to => {
  document.title = `${to.meta.title} — Folio`
})

export default router
