<template>
  <h2 class="mb-3">About</h2>

  <p class="text-muted mb-4">
    This is a small single page application for browsing books and authors. It was built with
    Vue 3, Vue Router, Pinia, and Bootstrap, and it reads its data from a json-server mock API.
  </p>

  <h4 class="mb-3">Frequently Asked Questions</h4>

  <div class="accordion" id="faqAccordion">
    <div class="accordion-item" v-for="(item, index) in faq" :key="index">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          :data-bs-target="`#faq-${index}`"
        >
          {{ item.question }}
        </button>
      </h2>

      <div :id="`faq-${index}`" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
        <div class="accordion-body text-muted">
          {{ item.answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const faq = [
  {
    question: "Where does the data come from?",
    answer:
      "All books and authors are stored in db.json and served by json-server on port 3000.",
  },
  {
    question: "How do I add a new book?",
    answer:
      "Log in to the admin area, open the Books table, and use the Add Book button to open the form.",
  },
  {
    question: "What are the login details?",
    answer: "The demo account uses admin as the username and admin as the password.",
  },
  {
    question: "Can I delete a book or an author?",
    answer:
      "Yes. Each row in the admin tables has a Delete button, and you will be asked to confirm first.",
  },
];
</script>

<style scoped>
.accordion-button:not(.collapsed) {
  background-color: #eef1fb;
  color: #2b3a67;
}
</style>
