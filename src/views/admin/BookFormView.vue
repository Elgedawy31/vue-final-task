<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalog } from '../../composables/useCatalog'
import { useFormValidation } from '../../composables/useFormValidation'
import { useToastsStore } from '../../stores/toasts'
import { request } from '../../api'
import { parseTags, validateBook } from '../../validation'
import PageHeading from '../../components/PageHeading.vue'
import DataState from '../../components/DataState.vue'
import FormField from '../../components/FormField.vue'
import BookCover from '../../components/BookCover.vue'
import AppIcon from '../../components/AppIcon.vue'
const route = useRoute()
const router = useRouter()
const toasts = useToastsStore()
const { books, authors, authorMap, loading, error, load: loadCatalog } = useCatalog()
const editing = computed(() => !!route.params.id)
const saving = ref(false)
const currentYear = new Date().getFullYear()
const missing = ref(false)
const serverError = ref('')
const authorError = ref('')
const values = reactive({
  title: '',
  authorId: '',
  year: '',
  tags: '',
  coverUrl: '',
  description: '',
})
const { valid, touch, fieldError, reveal } = useFormValidation(() =>
  validateBook(values, authors.items, books.items, route.params.id),
)
const preview = computed(() => ({
  ...values,
  title: values.title || 'Your next great story',
  tags: parseTags(values.tags),
}))
const previewAuthor = computed(() => authorMap.value[values.authorId]?.name || 'Author name')
const canSubmit = computed(() => valid.value && !saving.value && !loading.value)
const authorFieldError = computed(() => authorError.value || fieldError('authorId'))
async function load() {
  missing.value = false
  await loadCatalog()
  if (error.value || !editing.value) return
  loading.value = true
  try {
    const book = await books.fetchById(route.params.id)
    Object.assign(values, {
      title: book.title,
      authorId: String(book.authorId),
      year: book.year,
      tags: book.tags.join(', '),
      coverUrl: book.coverUrl,
      description: book.description,
    })
  } catch (failure) {
    if (failure.status === 404) missing.value = true
    else error.value = failure.message
  } finally {
    loading.value = false
  }
}
function changeAuthor() {
  authorError.value = ''
  touch('authorId')
}
async function save() {
  reveal()
  if (!canSubmit.value) return
  saving.value = true
  serverError.value = ''
  authorError.value = ''
  try {
    try {
      await request(`/authors/${encodeURIComponent(values.authorId)}`)
    } catch (failure) {
      if (failure.status === 404) {
        authorError.value = 'This author no longer exists. Choose another author.'
        await authors.fetchList()
        return
      }
      throw failure
    }
    await books.fetchList()
    if (!valid.value) return
    const payload = {
      title: values.title.trim(),
      authorId: values.authorId,
      year: Number(values.year),
      tags: parseTags(values.tags),
      coverUrl: values.coverUrl.trim(),
      description: values.description.trim(),
    }
    if (editing.value) await books.update(route.params.id, payload)
    else await books.create(payload)
    toasts.show(editing.value ? 'Book updated. A fresh chapter.' : 'A new book is on the shelf.')
    router.push('/admin/books')
  } catch (failure) {
    serverError.value = failure.message
    toasts.show(failure.message, 'error')
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>

<template>
  <RouterLink to="/admin/books" class="back-link"
    ><AppIcon name="back" :size="17" /> Back to books</RouterLink
  ><PageHeading
    eyebrow="THE COLLECTION"
    :title="editing ? 'A fresh edit.' : 'Make room for a new story.'"
    :description="
      editing
        ? 'Keep the details of this book up to date.'
        : 'Add a book and help a reader find their next favorite.'
    "
  /><DataState
    :loading="loading"
    :error="error"
    :empty="missing"
    title="Book not found"
    description="This book may have been removed from the collection."
    @retry="load"
    ><div class="form-layout">
      <form class="admin-panel editor-form" novalidate @submit.prevent="save">
        <div class="form-section-heading">
          <AppIcon name="book" :size="21" />
          <h2>Book details</h2>
          <span>* Required fields</span>
        </div>
        <div v-if="!authors.items.length" class="form-notice">
          Every book needs an author.
          <RouterLink to="/admin/authors/new">Add an author first.</RouterLink>
        </div>
        <FormField
          id="title"
          label="Book title"
          :error="fieldError('title')"
          required
          v-slot="field"
          ><input
            id="title"
            v-model="values.title"
            class="form-control"
            :class="{ 'is-invalid': field.invalid }"
            :aria-invalid="field.invalid"
            :aria-describedby="field.describedby"
            placeholder="e.g. Project Hail Mary"
            required
            @blur="touch('title')"
        /></FormField>
        <div class="row">
          <div class="col-md-8">
            <FormField
              id="authorId"
              label="Author"
              :error="authorFieldError"
              required
              v-slot="field"
              ><select
                id="authorId"
                v-model="values.authorId"
                class="form-select"
                :class="{ 'is-invalid': field.invalid }"
                :aria-invalid="field.invalid"
                :aria-describedby="field.describedby"
                required
                @change="changeAuthor"
                @blur="touch('authorId')"
              >
                <option value="" disabled>Select an author</option>
                <option v-for="author in authors.items" :key="author.id" :value="String(author.id)">
                  {{ author.name }}
                </option>
              </select></FormField
            >
          </div>
          <div class="col-md-4">
            <FormField
              id="year"
              label="Publication year"
              :error="fieldError('year')"
              required
              v-slot="field"
              ><input
                id="year"
                v-model="values.year"
                type="number"
                min="1800"
                :max="currentYear"
                step="1"
                class="form-control"
                :class="{ 'is-invalid': field.invalid }"
                :aria-invalid="field.invalid"
                :aria-describedby="field.describedby"
                placeholder="2021"
                required
                @blur="touch('year')"
            /></FormField>
          </div>
        </div>
        <FormField
          id="tags"
          label="Genres & tags"
          hint="Separate tags with commas. Up to 8 tags, 2–20 characters each."
          :error="fieldError('tags')"
          v-slot="field"
          ><input
            id="tags"
            v-model="values.tags"
            class="form-control"
            :class="{ 'is-invalid': field.invalid }"
            :aria-invalid="field.invalid"
            :aria-describedby="field.describedby"
            placeholder="e.g. science fiction, space"
            @blur="touch('tags')" /></FormField
        ><FormField
          id="coverUrl"
          label="Cover image URL"
          hint="Use a public http or https image URL. Leave blank for a Folio cover."
          :error="fieldError('coverUrl')"
          v-slot="field"
          ><input
            id="coverUrl"
            v-model="values.coverUrl"
            type="url"
            class="form-control"
            :class="{ 'is-invalid': field.invalid }"
            :aria-invalid="field.invalid"
            :aria-describedby="field.describedby"
            placeholder="https://example.com/cover.jpg"
            @blur="touch('coverUrl')" /></FormField
        ><FormField
          id="description"
          label="Description"
          :hint="`${values.description.length} / 2,000 characters`"
          :error="fieldError('description')"
          v-slot="field"
        >
          <textarea
            id="description"
            v-model="values.description"
            rows="6"
            class="form-control"
            :class="{ 'is-invalid': field.invalid }"
            :aria-invalid="field.invalid"
            :aria-describedby="field.describedby"
            placeholder="What is waiting between these covers?"
            @blur="touch('description')"
          ></textarea>
        </FormField>
        <p v-if="serverError" class="field-error" role="alert">{{ serverError }}</p>
        <div class="form-actions">
          <RouterLink to="/admin/books" class="btn btn-outline-secondary">Cancel</RouterLink
          ><button class="btn btn-primary" :disabled="!canSubmit">
            <span v-if="saving" class="spinner-border spinner-border-sm"></span
            ><AppIcon v-else name="check" :size="18" />{{
              saving ? 'Saving…' : editing ? 'Save changes' : 'Add book'
            }}
          </button>
        </div>
      </form>
      <aside class="form-preview">
        <p class="eyebrow">A LOOK AT YOUR SHELF</p>
        <BookCover :book="preview" :author="previewAuthor" />
        <h3>{{ preview.title }}</h3>
        <p>{{ previewAuthor }}</p>
        <div class="detail-tags">
          <span v-for="tag in preview.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <p class="preview-note">
          <AppIcon name="leaf" :size="17" /> Every good story deserves a good introduction.
        </p>
      </aside>
    </div></DataState
  >
</template>
