<template>
  <nav class="navbar navbar-expand-lg mb-5">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">Folio</RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item">
            <RouterLink class="nav-link px-3" to="/">Home</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link px-3" to="/books">Books</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link px-3" to="/authors">Authors</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link px-3" to="/about">About</RouterLink>
          </li>
          <li class="nav-item ms-lg-2">
            <RouterLink class="btn btn-primary btn-sm" to="/admin">Admin</RouterLink>
          </li>
          <li class="nav-item ms-lg-2" v-if="isLoggedIn">
            <button class="btn btn-outline-secondary btn-sm" @click="handleLogout">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const router = useRouter();
const authStore = useAuthStore();

const { isLoggedIn } = storeToRefs(authStore);
const { logout } = authStore;

const handleLogout = () => {
  logout();
  router.push("/");
};
</script>
