import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PublicLayout from '../components/PublicLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: PublicLayout,
      children: [
        {
          path: '',
          component: () => import('../views/HomeView.vue'),
          meta: { title: 'A home for good stories' },
        },
        {
          path: 'books',
          component: () => import('../views/BooksView.vue'),
          meta: { title: 'The collection' },
        },
        {
          path: 'books/:id',
          component: () => import('../views/BookDetailsView.vue'),
          meta: { title: 'Book details' },
        },
        {
          path: 'authors',
          component: () => import('../views/AuthorsView.vue'),
          meta: { title: 'The storytellers' },
        },
        {
          path: 'authors/:id',
          component: () => import('../views/AuthorDetailsView.vue'),
          meta: { title: 'Author details' },
        },
        {
          path: 'about',
          component: () => import('../views/AboutView.vue'),
          meta: { title: 'Our story' },
        },
        {
          path: 'login',
          component: () => import('../views/LoginView.vue'),
          meta: { title: 'Welcome back' },
        },
        {
          path: ':pathMatch(.*)*',
          component: () => import('../views/NotFoundView.vue'),
          meta: { title: 'Page not found' },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('../components/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('../views/admin/DashboardView.vue'),
          meta: { title: 'Overview' },
        },
        {
          path: 'books',
          component: () => import('../views/admin/BooksView.vue'),
          meta: { title: 'Manage books' },
        },
        {
          path: 'books/new',
          component: () => import('../views/admin/BookFormView.vue'),
          meta: { title: 'Add a book' },
        },
        {
          path: 'books/:id/edit',
          component: () => import('../views/admin/BookFormView.vue'),
          meta: { title: 'Edit book' },
        },
        {
          path: 'authors',
          component: () => import('../views/admin/AuthorsView.vue'),
          meta: { title: 'Manage authors' },
        },
        {
          path: 'authors/new',
          component: () => import('../views/admin/AuthorFormView.vue'),
          meta: { title: 'Add an author' },
        },
        {
          path: 'authors/:id/edit',
          component: () => import('../views/admin/AuthorFormView.vue'),
          meta: { title: 'Edit author' },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated)
    return { path: '/login', query: { redirect: to.fullPath } }
  if (to.path === '/login' && auth.isAuthenticated) return '/admin'
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Library'} — Folio`
  requestAnimationFrame(() =>
    document.querySelector('#main-content')?.focus({ preventScroll: true }),
  )
})

export default router
