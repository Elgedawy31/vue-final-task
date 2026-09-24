<template>
  <div class="about">
    <!-- Intro -->
    <section class="about-intro text-center">
      <p class="eyebrow mb-3">About</p>
      <h1 class="mb-4">A shelf worth browsing.</h1>

      <p class="lead-text text-muted mx-auto">
        Folio is a small library of books and the people who wrote them. Every
        book is tied to its author, so you can start with a title you like and
        end up somewhere you did not expect.
      </p>

      <p class="text-muted mx-auto mb-0">
        The collection is kept short on purpose. Nothing here gets buried, and
        you can look through the whole shelf in a few minutes.
      </p>
    </section>

    <!-- Questions -->
    <section class="about-faq">
      <p class="eyebrow text-center mb-4">Questions</p>

      <div class="accordion mx-auto" id="faq">
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
    </section>

    <!-- Links out -->
    <section class="about-links text-center">
      <RouterLink to="/books" class="btn btn-primary me-2">Browse Books</RouterLink>
      <RouterLink to="/authors" class="btn btn-outline-secondary">Authors</RouterLink>
    </section>
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
/* Break out of the 1180px page container so the page fills the screen */
.about {
  width: 100vw;
  position: relative;
  left: 50%;
  margin-left: -50vw;
}

.about-intro {
  background: var(--cream);
  border-bottom: 1px solid var(--line);
  padding: 72px 24px;
}

.lead-text {
  font-size: 1.15rem;
  line-height: 1.8;
  max-width: 660px;
}

.about-intro p:last-child {
  max-width: 660px;
}

.about-faq {
  padding: 64px 24px;
}

.accordion {
  max-width: 760px;
  --bs-accordion-border-color: var(--line);
  --bs-accordion-active-bg: var(--cream);
  --bs-accordion-active-color: var(--ink);
  --bs-accordion-btn-focus-box-shadow: none;
}

.accordion-button {
  font-weight: 500;
  font-size: 0.95rem;
}

.about-links {
  background: var(--cream);
  border-top: 1px solid var(--line);
  padding: 56px 24px;
}
</style>
