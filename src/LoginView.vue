<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './auth.js'
import AppIcon from './AppIcon.vue'
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const valid = computed(
  () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) && password.value.length > 0,
)
function login() {
  if (!valid.value || !auth.login(email.value, password.value)) return
  const destination = String(route.query.redirect || '/admin')
  router.replace(
    destination === '/admin' || destination.startsWith('/admin/') ? destination : '/admin',
  )
}
function fillDemo() {
  email.value = 'admin@folio.com'
  password.value = 'Folio123!'
}
</script>

<template>
  <div class="container px-4">
    <div class="login-wrap row g-4 g-lg-5 align-items-center py-5">
      <div class="col-md-6 col-lg-7">
        <div class="login-intro">
          <p class="eyebrow mt-0 mb-3 d-block fw-bold mx-0 small">
            THE KEEPER OF THE STORIES
          </p>
          <h1 class="fw-normal mx-0 my-3 my-md-4">
            A good library<br />starts with
            <em class="fw-normal text-body-secondary">you.</em>
          </h1>
          <p class="mt-0 text-body-secondary mx-0">
            Make space for new voices.<br />Keep your collection growing.
          </p>
          <AppIcon class="mt-3" name="book" :size="110" />
        </div>
      </div>
      <div class="col-md-6 col-lg-5">
        <section class="login-card border rounded-2 p-4 bg-body-tertiary">
          <span
            class="feature-icon rounded-3 d-inline-flex align-items-center justify-content-center mb-4"
            ><AppIcon name="lock" :size="24"
          /></span>
          <h2 class="fw-normal mb-2 fs-1">Welcome back.</h2>
          <p class="muted mt-0 mb-4 text-body-secondary mx-0 small">
            Sign in to your library dashboard.
          </p>
          <form @submit.prevent="login">
            <div class="form-field mb-4">
              <label for="email" class="form-label fw-medium mb-2 small"
                >Email address</label
              ><input
                id="email"
                v-model="email"
                class="form-control text-body rounded-1 py-2 px-3 small"
                type="email"
                required
                autocomplete="username"
                placeholder="you@example.com"
                :aria-invalid="!!auth.error"
              />
            </div>
            <div class="form-field mb-4">
              <label for="password" class="form-label fw-medium mb-2 small"
                >Password</label
              ><input
                id="password"
                v-model="password"
                class="form-control text-body rounded-1 py-2 px-3 small"
                type="password"
                required
                autocomplete="current-password"
                placeholder="Enter your password"
                :aria-invalid="!!auth.error"
                :aria-describedby="auth.error ? 'login-error' : undefined"
              />
            </div>
            <p
              v-if="auth.error"
              id="login-error"
              class="field-error mt-2 mb-0 mx-0 small"
              role="alert"
            >
              {{ auth.error }}
            </p>
            <button
              class="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
              :disabled="!valid"
            >
              Sign in <AppIcon class="flex-shrink-0" name="arrow" :size="18" />
            </button>
          </form>
          <div class="demo-account border-top pt-4 mt-4 small">
            <span class="eyebrow d-block fw-bold mb-3 small"
              >TAKE A LOOK AROUND</span
            >
            <p class="mt-0 text-body-secondary mx-0">
              Demo email:
              <strong class="fw-medium text-body">admin@folio.com</strong
              ><br />Password:
              <strong class="fw-medium text-body">Folio123!</strong>
            </p>
            <button
              class="text-link d-inline-flex align-items-center gap-2 fw-semibold border-0 bg-transparent p-0 small"
              @click="fillDemo"
            >
              Use demo account
              <AppIcon class="flex-shrink-0" name="arrow" :size="16" />
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
