<script setup>
import AppIcon from './AppIcon.vue'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer border-top pt-5 bg-body-tertiary">
    <div class="container px-4">
      <div class="footer-top row g-4 pb-4">
        <div class="col-6 col-md-4">
          <div>
            <RouterLink
              to="/"
              class="brand text-decoration-none d-inline-flex align-items-center gap-2"
              ><AppIcon class="flex-shrink-0" name="book" :size="26" />
              folio<span class="brand-dot">.</span></RouterLink
            >
            <p class="mt-3 text-body-secondary mx-0 small">
              A home for good stories.<br />And the people who tell them.
            </p>
          </div>
        </div>
        <div class="col-6 col-md-4">
          <div
            class="footer-links d-flex flex-column align-items-start gap-2 ps-3 ps-md-5 small"
          >
            <span class="eyebrow d-block fw-bold mb-2 small">EXPLORE</span
            ><RouterLink class="text-decoration-none" to="/books"
              >The collection</RouterLink
            ><RouterLink class="text-decoration-none" to="/authors"
              >Meet the authors</RouterLink
            ><RouterLink class="text-decoration-none" to="/about"
              >Our story</RouterLink
            >
          </div>
        </div>
        <div class="col-md-4 d-none d-md-block">
          <div
            class="footer-note d-none d-md-flex align-items-center gap-3 justify-content-end"
          >
            <AppIcon class="text-body-secondary" name="leaf" :size="26" />
            <p class="m-0 fs-4">
              A little reading.<br /><span class="fs-5"
                >A world of possibility.</span
              >
            </p>
          </div>
        </div>
      </div>
      <div
        class="footer-bottom border-top d-flex justify-content-between px-0 py-3 text-body-secondary small"
      >
        <span>© {{ year }} Folio. Made for the love of reading.</span
        ><RouterLink
          class="text-decoration-none d-flex align-items-center gap-2"
          to="/admin"
          >Manage your library
          <AppIcon class="flex-shrink-0" name="arrow" :size="15"
        /></RouterLink>
      </div>
    </div>
  </footer>
</template>
