<template>
  <!-- Hero -->
  <div class="hero p-5 mb-5">
    <div class="row align-items-center g-4">
      <div class="col-lg-7">
        <p class="eyebrow mb-3">About Folio</p>

        <h1 class="mb-3">A small library, built with Vue.</h1>

        <p class="text-muted mb-0" style="max-width: 520px">
          Folio is a place to browse books and the people who wrote them. Every book
          links back to its author, every author shows the books they have on the
          shelf, and the whole collection can be managed from a single admin area.
        </p>
      </div>

      <div class="col-lg-5 d-none d-lg-block">
        <div class="hero-counts">
          <div class="mb-4">
            <div class="stat-number">{{ books.length }}</div>
            <p class="eyebrow mb-0">Books</p>
          </div>

          <div>
            <div class="stat-number">{{ authors.length }}</div>
            <p class="eyebrow mb-0">Authors</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- The story -->
  <div class="row g-5 mb-5">
    <div class="col-lg-7">
      <p class="eyebrow mb-2">The idea</p>
      <h2 class="mb-3">Built to practise, made to use.</h2>

      <p class="text-muted">
        This project started as the final task for a Vue course, but it is put
        together the way a real application would be. The pages are split into
        views, the pieces that repeat live in their own components, and the data
        is kept in Pinia stores so that any page can reach it without passing
        props down a long chain.
      </p>

      <p class="text-muted mb-0">
        Nothing here is hidden behind a framework trick. The books come from a
        mock API over plain <code>fetch</code>, loading and error states are
        handled in one shared component, and the styling is Bootstrap with a small
        set of colour and font rules on top.
      </p>
    </div>

    <div class="col-lg-5">
      <div class="card h-100">
        <div class="card-body p-4">
          <p class="eyebrow mb-3">Built with</p>

          <ul class="list-unstyled mb-0">
            <li class="tech-row" v-for="item in stack" :key="item.name">
              <span class="tech-name">{{ item.name }}</span>
              <span class="text-muted small">{{ item.role }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- What you can do -->
  <p class="eyebrow mb-2">Features</p>
  <h2 class="mb-4">What you can do here</h2>

  <div class="row g-4 mb-5">
    <div class="col-md-6 col-lg-4" v-for="feature in features" :key="feature.title">
      <div class="card h-100">
        <div class="card-body p-4">
          <h5 class="mb-2">{{ feature.title }}</h5>
          <p class="text-muted small mb-0">{{ feature.text }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- FAQ -->
  <p class="eyebrow mb-2">Questions</p>
  <h2 class="mb-4">Frequently asked questions</h2>

  <div class="row g-4 mb-4">
    <div class="col-lg-6" v-for="(column, columnIndex) in faqColumns" :key="columnIndex">
      <div class="accordion" :id="`faq-${columnIndex}`">
        <div class="accordion-item" v-for="item in column" :key="item.question">
          <h3 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              :data-bs-target="`#answer-${item.id}`"
            >
              {{ item.question }}
            </button>
          </h3>

          <div
            :id="`answer-${item.id}`"
            class="accordion-collapse collapse"
            :data-bs-parent="`#faq-${columnIndex}`"
          >
            <div class="accordion-body text-muted small">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Closing note -->
  <div class="hero p-4 p-md-5 d-flex flex-wrap justify-content-between align-items-center gap-3">
    <div>
      <h4 class="mb-1">Have a look around</h4>
      <p class="text-muted mb-0">Start with the shelf, or go straight to an author.</p>
    </div>

    <div>
      <RouterLink to="/books" class="btn btn-primary me-2">Browse Books</RouterLink>
      <RouterLink to="/authors" class="btn btn-outline-secondary">Authors</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useBookStore } from "../stores/book.js";
import { useAuthorStore } from "../stores/author.js";

const bookStore = useBookStore();
const authorStore = useAuthorStore();

const { books } = storeToRefs(bookStore);
const { authors } = storeToRefs(authorStore);
const { getAllBooks } = bookStore;
const { getAllAuthors } = authorStore;

const stack = [
  { name: "Vue 3", role: "Composition API" },
  { name: "Vue Router", role: "Pages and route params" },
  { name: "Pinia", role: "Shared state" },
  { name: "Bootstrap 5", role: "Layout and components" },
  { name: "json-server", role: "Mock REST API" },
  { name: "Vite", role: "Dev server and build" },
];

const features = [
  {
    title: "Browse the shelf",
    text: "Every book shows its cover, author, year, and tags. Search by title or narrow the list down to one author.",
  },
  {
    title: "Follow an author",
    text: "Open an author to read a short biography and see every book of theirs in the collection.",
  },
  {
    title: "Manage the collection",
    text: "The admin area has tables for books and authors, with forms to add, edit, and remove them.",
  },
  {
    title: "Forms that check themselves",
    text: "Titles, years, tags, and links are all validated as you type, and the save button stays off until the form is valid.",
  },
  {
    title: "Honest loading states",
    text: "Every list shows a spinner while it loads, a clear message when it is empty, and a retry button if something fails.",
  },
  {
    title: "Ask the assistant",
    text: "Book and author pages have a chat button that answers questions about what you are reading.",
  },
];

const faq = [
  {
    id: "data",
    question: "Where does the data come from?",
    answer:
      "Books and authors live in db.json and are served by json-server on port 3000. Run npm run server in one terminal and npm run dev in another.",
  },
  {
    id: "login",
    question: "What are the login details?",
    answer: "The demo account uses admin as both the username and the password.",
  },
  {
    id: "add",
    question: "How do I add a new book?",
    answer:
      "Sign in, open Manage Books from the admin dashboard, and use the Add Book button. Pick an author from the list, and the form will check the rest for you.",
  },
  {
    id: "delete",
    question: "Can I delete a book or an author?",
    answer:
      "Yes. Each row in the admin tables has a Delete button, and you are asked to confirm before anything is removed.",
  },
  {
    id: "saved",
    question: "Are my changes saved?",
    answer:
      "Yes. Everything you add or edit is written back to db.json, so it is still there the next time you start the app.",
  },
  {
    id: "chat",
    question: "Why is the chat not answering?",
    answer:
      "The assistant needs a Google Gemini key. Copy .env.example to .env, add your key, and restart the dev server. The rest of the app works without it.",
  },
];

// Split the questions into two columns so the list is not one long strip
const faqColumns = computed(() => [faq.slice(0, 3), faq.slice(3)]);

onMounted(async () => {
  await getAllBooks();
  await getAllAuthors();
});
</script>

<style scoped>
.hero-counts {
  border-left: 1px solid #e0d3d7;
  padding-left: 2.5rem;
}

.tech-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}

.tech-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.tech-name {
  font-weight: 500;
}

code {
  color: var(--wine);
  background: var(--cream);
  padding: 1px 5px;
  border-radius: 3px;
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
