<template>
  <div class="row justify-content-center py-4">
    <div class="col-md-5">
      <div class="card">
        <div class="card-body p-4">
          <p class="eyebrow mb-2">Admin</p>
          <h3 class="mb-2">Sign in</h3>
          <p class="text-muted small mb-4">
            Use <strong>admin</strong> / <strong>admin</strong> to sign in.
          </p>

          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label" for="username">Username</label>
              <input id="username" type="text" class="form-control" v-model="username" />
            </div>

            <div class="mb-3">
              <label class="form-label" for="password">Password</label>
              <input id="password" type="password" class="form-control" v-model="password" />
            </div>

            <div v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</div>

            <button type="submit" class="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import { useToastStore } from "../stores/toast.js";

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const { login } = authStore;
const { showToast } = toastStore;

const username = ref("");
const password = ref("");
const errorMessage = ref("");

const handleSubmit = () => {
  const success = login(username.value, password.value);

  if (success) {
    showToast("Welcome back!");
    router.push("/admin");
  } else {
    errorMessage.value = "Wrong username or password.";
  }
};
</script>
