<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppIcon from '../components/AppIcon.vue'
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
  <div class="container login-wrap">
    <div class="login-intro">
      <p class="eyebrow">THE KEEPER OF THE STORIES</p>
      <h1>A good library<br />starts with <em>you.</em></h1>
      <p>Make space for new voices.<br />Keep your collection growing.</p>
      <AppIcon name="book" :size="110" />
    </div>
    <section class="login-card">
      <span class="feature-icon"><AppIcon name="lock" :size="24" /></span>
      <h2>Welcome back.</h2>
      <p class="muted">Sign in to your library dashboard.</p>
      <form @submit.prevent="login">
        <div class="form-field">
          <label for="email" class="form-label">Email address</label
          ><input
            id="email"
            v-model="email"
            class="form-control"
            type="email"
            required
            autocomplete="username"
            placeholder="you@example.com"
            :aria-invalid="!!auth.error"
          />
        </div>
        <div class="form-field">
          <label for="password" class="form-label">Password</label
          ><input
            id="password"
            v-model="password"
            class="form-control"
            type="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
            :aria-invalid="!!auth.error"
            :aria-describedby="auth.error ? 'login-error' : undefined"
          />
        </div>
        <p v-if="auth.error" id="login-error" class="field-error" role="alert">{{ auth.error }}</p>
        <button class="btn btn-primary w-100" :disabled="!valid || auth.loading">
          Sign in <AppIcon name="arrow" :size="18" />
        </button>
      </form>
      <div class="demo-account">
        <span class="eyebrow">TAKE A LOOK AROUND</span>
        <p>
          Demo email: <strong>admin@folio.com</strong><br />Password: <strong>Folio123!</strong>
        </p>
        <button class="text-link" @click="fillDemo">
          Use demo account <AppIcon name="arrow" :size="16" />
        </button>
      </div>
    </section>
  </div>
</template>
