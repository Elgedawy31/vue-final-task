import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import BooksView from "../views/BooksView.vue";
import BookDetailsView from "../views/BookDetailsView.vue";
import AuthorsView from "../views/AuthorsView.vue";
import AuthorDetailsView from "../views/AuthorDetailsView.vue";
import LoginView from "../views/LoginView.vue";
import AdminView from "../views/AdminView.vue";
import AdminBooksView from "../views/AdminBooksView.vue";
import AdminBookFormView from "../views/AdminBookFormView.vue";
import AdminAuthorsView from "../views/AdminAuthorsView.vue";
import AdminAuthorFormView from "../views/AdminAuthorFormView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: HomeView },
    { path: "/about", component: AboutView },
    { path: "/books", component: BooksView },
    { path: "/books/:id", component: BookDetailsView },
    { path: "/authors", component: AuthorsView },
    { path: "/authors/:id", component: AuthorDetailsView },
    { path: "/login", component: LoginView },

    { path: "/admin", component: AdminView, meta: { needsAuth: true } },
    { path: "/admin/books", component: AdminBooksView, meta: { needsAuth: true } },
    { path: "/admin/books/new", component: AdminBookFormView, meta: { needsAuth: true } },
    { path: "/admin/books/:id/edit", component: AdminBookFormView, meta: { needsAuth: true } },
    { path: "/admin/authors", component: AdminAuthorsView, meta: { needsAuth: true } },
    { path: "/admin/authors/new", component: AdminAuthorFormView, meta: { needsAuth: true } },
    { path: "/admin/authors/:id/edit", component: AdminAuthorFormView, meta: { needsAuth: true } },

    { path: "/:pathMatch(.*)*", component: NotFoundView },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.needsAuth && !authStore.isLoggedIn) {
    return "/login";
  }
});

export default router;
