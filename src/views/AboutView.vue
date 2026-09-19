<script setup>
import { ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
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
  <div class="container page-space">
    <section class="about-hero">
      <p class="eyebrow">OUR STORY</p>
      <h1>Good stories deserve<br />a place to <em>belong.</em></h1>
      <p>
        We believe a book is more than a collection of pages.<br />It’s a new perspective, a
        familiar friend, a door left open.
      </p>
      <div class="about-illustration" aria-hidden="true">
        <span>stay curious.</span><AppIcon name="book" :size="88" /><span>keep reading.</span>
      </div>
    </section>
    <section class="about-values row g-5">
      <div class="col-md-5">
        <p class="eyebrow">A THOUGHTFUL LITTLE LIBRARY</p>
        <h2>For every kind<br />of reader.</h2>
      </div>
      <div class="col-md-7">
        <p>
          Folio brings stories and storytellers together. A quiet corner of the internet to browse a
          shelf, discover a voice, and find something you didn’t know you were looking for.
        </p>
        <p>
          From your first classic to your next late-night page-turner, we’re here to make exploring
          feel a little more personal. No rush. No reading rules. Just follow your curiosity.
        </p>
        <RouterLink to="/books" class="text-link"
          >Find your next chapter <AppIcon name="arrow" :size="18"
        /></RouterLink>
      </div>
    </section>
    <section class="faq-section">
      <div class="section-heading centered">
        <p class="eyebrow">A FEW THINGS TO KNOW</p>
        <h2>Glad you asked.</h2>
      </div>
      <div class="accordion" id="folio-faq">
        <div v-for="(item, index) in questions" :key="item.question" class="accordion-item">
          <h3 class="accordion-header">
            <button
              :id="`faq-question-${index}`"
              class="accordion-button"
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
            <div class="accordion-body">{{ item.answer }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
