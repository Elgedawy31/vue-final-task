<script setup>
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'
</script>

<template>
  <Navbar />
  <main id="main-content" tabindex="-1"><RouterView :key="$route.path" /></main>
  <Footer />
</template>
