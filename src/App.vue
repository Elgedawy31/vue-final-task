<template>
  <Navbar />

  <div class="container">
    <RouterView />
  </div>

  <Footer />

  <Toast />
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import Toast from "./components/Toast.vue";
</script>
