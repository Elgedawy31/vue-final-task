<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
const active = ref(0)
const questions = [
  {
    question: 'What is Folio?',
    answer:
      'Folio is a home for books and the people who write them. Browse the collection, discover authors, and follow your curiosity from one story to the next.',
  },
  {
    question: 'Can I read or buy books here?',
    answer:
      'Folio is a discovery library, so it provides book information and author profiles. It does not sell books or provide full book downloads. Once you find a favorite, look for it at your local library or bookshop.',
  },
  {
    question: 'How does the reading assistant work?',
    answer:
      'Open any book or author page and select the chat button in the bottom-right corner. Ask for an introduction, explore themes, or learn about the author. The assistant uses the current page as context. Answers can contain mistakes, so check important details.',
  },
  {
    question: 'How do I manage the collection?',
    answer:
      'Open the dashboard and sign in using the demo account shown on the login page. You can add, edit, and remove books and authors. Authors with books in the collection must have those books reassigned or removed before the author can be deleted.',
  },
  {
    question: 'Can I explore by author or genre?',
    answer:
      'Absolutely. The collection lets you search by title, filter by author or genre, and sort your results. Author pages bring all of that writer’s books together in one place.',
  },
]
function toggle(index) {
  active.value = active.value === index ? null : index
}
</script>

<template>
  <div class="container page-space pt-4 pt-md-5 pb-5 px-4">
    <section class="about-hero text-center pt-3 pb-4 px-0">
      <p class="eyebrow mt-0 mb-3 d-block fw-bold mx-0 small">OUR STORY</p>
      <h1 class="fw-normal mx-0 my-4">
        Good stories deserve<br />a place to
        <em class="fw-normal text-body-secondary">belong.</em>
      </h1>
      <p class="mt-0 text-body-secondary mx-0 small">
        We believe a book is more than a collection of pages.<br />It’s a new
        perspective, a familiar friend, a door left open.
      </p>
      <div
        class="about-illustration mt-5 rounded-2 d-flex align-items-center justify-content-center gap-3 gap-md-5 px-3 py-4 px-md-4 text-body-secondary"
        aria-hidden="true"
      >
        <span class="fst-italic">stay curious.</span
        ><AppIcon name="book" :size="88" /><span class="fst-italic"
          >keep reading.</span
        >
      </div>
    </section>
    <section class="about-values row g-5 border-bottom px-0 py-5">
      <div class="col-md-5">
        <p class="eyebrow mt-0 mb-3 d-block fw-bold mx-0 small">
          A THOUGHTFUL LITTLE LIBRARY
        </p>
        <h2 class="fw-normal">For every kind<br />of reader.</h2>
      </div>
      <div class="col-md-7">
        <p class="mt-0 text-body-secondary mx-0 small">
          Folio brings stories and storytellers together. A quiet corner of the
          internet to browse a shelf, discover a voice, and find something you
          didn’t know you were looking for.
        </p>
        <p class="mt-0 text-body-secondary mx-0 small">
          From your first classic to your next late-night page-turner, we’re
          here to make exploring feel a little more personal. No rush. No
          reading rules. Just follow your curiosity.
        </p>
        <RouterLink
          to="/books"
          class="text-link text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold border-0 bg-transparent p-0 small"
          >Find your next chapter
          <AppIcon class="flex-shrink-0" name="arrow" :size="18"
        /></RouterLink>
      </div>
    </section>
    <section class="faq-section pt-5 pb-0 m-auto px-0">
      <div
        class="section-heading centered d-block justify-content-between align-items-end gap-3 mb-5 text-center"
      >
        <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
          A FEW THINGS TO KNOW
        </p>
        <h2 class="fw-normal mb-2">Glad you asked.</h2>
      </div>
      <div class="accordion" id="folio-faq">
        <div
          v-for="(item, index) in questions"
          :key="item.question"
          class="accordion-item"
        >
          <h3 class="accordion-header fw-normal">
            <button
              :id="`faq-question-${index}`"
              class="accordion-button fw-medium px-0 py-4 small"
              :class="{ collapsed: active !== index }"
              :aria-expanded="active === index"
              :aria-controls="`faq-answer-${index}`"
              @click="toggle(index)"
            >
              {{ item.question }}
            </button>
          </h3>
          <div
            v-show="active === index"
            :id="`faq-answer-${index}`"
            class="accordion-collapse"
            role="region"
            :aria-labelledby="`faq-question-${index}`"
          >
            <div
              class="accordion-body pt-0 pe-4 pb-4 ps-0 text-body-secondary small"
            >
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
