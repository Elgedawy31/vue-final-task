<template>
  <div class="page">
    <Navbar />

    <main class="container flex-grow-1">
      <RouterView />
    </main>

    <Footer />
  </div>

  <Toast />
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import Toast from "./components/Toast.vue";
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
