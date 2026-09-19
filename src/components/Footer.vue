<script setup>
import AppIcon from './AppIcon.vue'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div>
          <RouterLink to="/" class="brand"
            ><AppIcon name="book" :size="26" /> folio<span class="brand-dot">.</span></RouterLink
          >
          <p>A home for good stories.<br />And the people who tell them.</p>
        </div>
        <div class="footer-links">
          <span class="eyebrow">EXPLORE</span><RouterLink to="/books">The collection</RouterLink
          ><RouterLink to="/authors">Meet the authors</RouterLink
          ><RouterLink to="/about">Our story</RouterLink>
        </div>
        <div class="footer-note">
          <AppIcon name="leaf" :size="26" />
          <p>A little reading.<br /><span>A world of possibility.</span></p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {{ year }} Folio. Made for the love of reading.</span
        ><RouterLink to="/admin"
          >Manage your library <AppIcon name="arrow" :size="15"
        /></RouterLink>
      </div>
    </div>
  </footer>
</template>
