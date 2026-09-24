<template>
  <!-- Hero -->
  <div class="hero p-5 mb-5">
    <div class="row align-items-center g-4">
      <div class="col-lg-7">
        <p class="eyebrow mb-3">About</p>

        <h1 class="mb-3">A shelf worth browsing.</h1>

        <p class="text-muted mb-0" style="max-width: 520px">
          Folio is a small, carefully kept library. Every book here is tied to the
          person who wrote it, so you can start with a title you like and end up
          somewhere you did not expect.
        </p>
      </div>

      <div class="col-lg-5 d-none d-lg-block">
        <div class="hero-counts">
          <div class="mb-4">
            <div class="stat-number">{{ books.length }}</div>
            <p class="eyebrow mb-0">Books on the shelf</p>
          </div>

          <div>
            <div class="stat-number">{{ authors.length }}</div>
            <p class="eyebrow mb-0">Authors</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- What it is -->
  <div class="row g-5 mb-5 align-items-start">
    <div class="col-lg-7">
      <p class="eyebrow mb-2">What this is</p>
      <h2 class="mb-3">Small on purpose.</h2>

      <p class="text-muted">
        Most reading sites try to hold everything ever published. This one does
        not. It keeps a short collection where each entry has a cover, a year,
        a handful of tags, and a description worth reading.
      </p>

      <p class="text-muted mb-0">
        Because the collection is small, nothing gets buried. You can look through
        the whole shelf in a few minutes, and every author page shows you the rest
        of their work straight away.
      </p>
    </div>

    <div class="col-lg-5">
      <div class="card">
        <div class="card-body p-4">
          <p class="eyebrow mb-3">In the collection</p>

          <ul class="list-unstyled mb-0">
            <li class="genre-row" v-for="genre in topGenres" :key="genre.name">
              <span>{{ genre.name }}</span>
              <span class="text-muted small">{{ genre.count }}</span>
            </li>

            <li v-if="topGenres.length === 0" class="text-muted small">
              Loading the shelf...
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- How to use it -->
  <p class="eyebrow mb-2">Getting around</p>
  <h2 class="mb-4">Three ways in</h2>

  <div class="row g-4 mb-5">
    <div class="col-md-4" v-for="(step, index) in steps" :key="step.title">
      <div class="card h-100">
        <div class="card-body p-4">
          <span class="step-number">0{{ index + 1 }}</span>

          <h5 class="mt-3 mb-2">{{ step.title }}</h5>
          <p class="text-muted small mb-3">{{ step.text }}</p>

          <RouterLink :to="step.to" class="btn btn-outline-secondary btn-sm">
            {{ step.action }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>

  <!-- Oldest and newest -->
  <div class="row g-4 mb-5" v-if="oldest && newest">
    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-body p-4">
          <p class="eyebrow mb-2">Oldest on the shelf</p>
          <h4 class="mb-1">{{ oldest.title }}</h4>
          <p class="text-muted small mb-3">
            {{ authorName(oldest.authorId) }} &middot; {{ oldest.year }}
          </p>
          <RouterLink :to="`/books/${oldest.id}`" class="btn btn-outline-secondary btn-sm">
            Read about it
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-body p-4">
          <p class="eyebrow mb-2">Most recent</p>
          <h4 class="mb-1">{{ newest.title }}</h4>
          <p class="text-muted small mb-3">
            {{ authorName(newest.authorId) }} &middot; {{ newest.year }}
          </p>
          <RouterLink :to="`/books/${newest.id}`" class="btn btn-outline-secondary btn-sm">
            Read about it
          </RouterLink>
        </div>
      </div>
    </div>
  </div>

  <!-- FAQ -->
  <p class="eyebrow mb-2">Questions</p>
  <h2 class="mb-4">Frequently asked questions</h2>

  <div class="row g-4 mb-5">
    <div class="col-lg-6" v-for="(column, columnIndex) in faqColumns" :key="columnIndex">
      <div class="accordion" :id="`faq-${columnIndex}`">
        <div class="accordion-item" v-for="item in column" :key="item.id">
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
      <h4 class="mb-1">Start reading</h4>
      <p class="text-muted mb-0">Pick a book, or see who wrote what.</p>
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

const steps = [
  {
    title: "Browse the shelf",
    text: "See every book with its cover and year. Search by title, or show only one author's work.",
    to: "/books",
    action: "Open Books",
  },
  {
    title: "Follow an author",
    text: "Read a short biography, then jump to the rest of the books they have here.",
    to: "/authors",
    action: "Open Authors",
  },
  {
    title: "Ask about a book",
    text: "Every book and author page has a chat button that answers questions about what you are reading.",
    to: "/books",
    action: "Try it",
  },
];

// Count how often each tag appears, and show the most common ones
const topGenres = computed(() => {
  const counts = {};

  books.value.forEach((book) => {
    (book.tags || []).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  return Object.keys(counts)
    .map((name) => ({ name, count: counts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
});

const byYear = computed(() =>
  books.value.filter((book) => book.year).slice().sort((a, b) => a.year - b.year)
);

const oldest = computed(() => byYear.value[0] || null);
const newest = computed(() => byYear.value[byYear.value.length - 1] || null);

const authorName = (authorId) => {
  const author = authors.value.find((a) => a.id === authorId);
  return author ? author.name : "Unknown author";
};

const faq = [
  {
    id: "choose",
    question: "How are the books chosen?",
    answer:
      "The shelf is kept small on purpose. Each book is added by hand with a cover, a year, tags, and a description, so there is nothing here to scroll past.",
  },
  {
    id: "search",
    question: "How do I find a particular book?",
    answer:
      "Open Books and type part of the title in the search box. You can also pick an author from the filter to see only their work.",
  },
  {
    id: "chat",
    question: "What can the chat answer?",
    answer:
      "It answers questions about the book or author whose page you are on: what it is about, what themes it explores, or what else the author has written. It avoids spoilers unless you ask for them.",
  },
  {
    id: "suggest",
    question: "Can I add a book myself?",
    answer:
      "Yes. The admin area has forms for adding books and authors, and anything you add shows up on the shelf straight away.",
  },
  {
    id: "login",
    question: "How do I get into the admin area?",
    answer: "Sign in from the Admin link using admin as both the username and the password.",
  },
  {
    id: "saved",
    question: "Are my changes kept?",
    answer:
      "Yes. Anything you add or edit is saved, so it is still there the next time you open the site.",
  },
];

// Two columns so the list is not one long strip
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

.genre-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  text-transform: capitalize;
}

.genre-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.step-number {
  font-family: var(--serif);
  font-size: 1.2rem;
  color: var(--wine);
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
