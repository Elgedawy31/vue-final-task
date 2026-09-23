<template>
  <footer class="site-footer pt-5 pb-4 mt-5">
    <div class="container">
      <div class="row g-4">
        <!-- Brand -->
        <div class="col-lg-5">
          <p class="footer-brand mb-2">Folio</p>
          <p class="small mb-0" style="max-width: 320px">
            A small library of books and the people who wrote them.
          </p>
        </div>

        <!-- Browse -->
        <div class="col-6 col-lg-3">
          <p class="footer-heading mb-3">Browse</p>
          <ul class="list-unstyled small mb-0">
            <li class="mb-2"><RouterLink to="/">Home</RouterLink></li>
            <li class="mb-2"><RouterLink to="/books">Books</RouterLink></li>
            <li class="mb-2"><RouterLink to="/authors">Authors</RouterLink></li>
            <li><RouterLink to="/about">About</RouterLink></li>
          </ul>
        </div>

        <!-- Admin -->
        <div class="col-6 col-lg-4">
          <p class="footer-heading mb-3">Admin</p>
          <ul class="list-unstyled small mb-0">
            <li class="mb-2"><RouterLink to="/admin">Dashboard</RouterLink></li>
            <li class="mb-2"><RouterLink to="/admin/books">Manage Books</RouterLink></li>
            <li class="mb-2"><RouterLink to="/admin/authors">Manage Authors</RouterLink></li>
            <li><RouterLink to="/login">Sign in</RouterLink></li>
          </ul>
        </div>
      </div>

      <hr class="footer-line my-4" />

      <p class="small mb-0">&copy; 2026 Folio</p>
    </div>
  </footer>
</template>

<style scoped>
.footer-brand {
  font-family: var(--serif);
  font-size: 1.6rem;
  color: #fff;
}

.footer-heading {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #caa5b0;
}

.footer-line {
  border-color: #7c4152;
  opacity: 1;
}
</style>
