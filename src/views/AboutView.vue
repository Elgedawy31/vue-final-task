<template>
  <div class="row g-5">
    <!-- Left: what it is -->
    <div class="col-lg-5">
      <p class="eyebrow mb-2">About</p>
      <h1 class="mb-4">A shelf worth browsing.</h1>

      <p class="lead-text text-muted">
        Folio is a small library of books and the people who wrote them. Every
        book is tied to its author, so you can start with a title you like and
        end up somewhere you did not expect.
      </p>

      <p class="text-muted">
        The collection is kept short on purpose. Nothing here gets buried, and
        you can look through the whole shelf in a few minutes.
      </p>

      <div class="mt-4">
        <RouterLink to="/books" class="btn btn-primary me-2">Browse Books</RouterLink>
        <RouterLink to="/authors" class="btn btn-outline-secondary">Authors</RouterLink>
      </div>
    </div>

    <!-- Right: questions -->
    <div class="col-lg-6 offset-lg-1">
      <p class="eyebrow mb-3">Questions</p>

      <div class="accordion" id="faq">
        <div class="accordion-item" v-for="item in faq" :key="item.id">
          <h2 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              :data-bs-target="`#answer-${item.id}`"
            >
              {{ item.question }}
            </button>
          </h2>

          <div
            :id="`answer-${item.id}`"
            class="accordion-collapse collapse"
            data-bs-parent="#faq"
          >
            <div class="accordion-body text-muted small">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const faq = [
  {
    id: "search",
    question: "How do I find a particular book?",
    answer:
      "Open Books and type part of the title in the search box. You can also filter by author or by genre.",
  },
  {
    id: "chat",
    question: "What can the chat answer?",
    answer:
      "It answers questions about the book or author whose page you are on: what it is about, what themes it explores, or what else the author has written.",
  },
  {
    id: "add",
    question: "Can I add a book myself?",
    answer:
      "Yes. Sign in from the Admin link using admin as both the username and the password, then use the forms to add, edit, or remove anything.",
  },
  {
    id: "saved",
    question: "Are my changes kept?",
    answer:
      "Yes. Anything you add or edit is saved, so it is still there the next time you open the site.",
  },
];
</script>

<style scoped>
.lead-text {
  font-size: 1.1rem;
  line-height: 1.75;
}

.accordion {
  --bs-accordion-border-color: var(--line);
  --bs-accordion-active-bg: var(--cream);
  --bs-accordion-active-color: var(--ink);
  --bs-accordion-btn-focus-box-shadow: none;
}

.accordion-button {
  font-weight: 500;
  font-size: 0.95rem;
}
</style>
