<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCatalog } from '../../composables/useCatalog'
import { useToastsStore } from '../../stores/toasts'
import PageHeading from '../../components/PageHeading.vue'
import DataState from '../../components/DataState.vue'
import BookCover from '../../components/BookCover.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import AppIcon from '../../components/AppIcon.vue'
const { books, authors, authorMap, loading, error, load } = useCatalog()
const toasts = useToastsStore()
const search = ref('')
const authorId = ref('')
const selected = ref(null)
const deleting = ref(false)
const filtered = computed(() =>
  books.items.filter(
    (book) =>
      book.title.toLowerCase().includes(search.value.trim().toLowerCase()) &&
      (!authorId.value || String(book.authorId) === authorId.value),
  ),
)
const deleteMessage = computed(
  () => `“${selected.value?.title}” will be removed from the library. This cannot be undone.`,
)
async function confirmDelete() {
  deleting.value = true
  try {
    await books.remove(selected.value.id)
    toasts.show('Book removed from the collection.')
    selected.value = null
  } catch (failure) {
    toasts.show(failure.message, 'error')
  } finally {
    deleting.value = false
  }
}
onMounted(load)
</script>

<template>
  <PageHeading
    eyebrow="THE COLLECTION"
    title="Your books."
    description="Every great library starts with a well-kept shelf."
    ><RouterLink to="/admin/books/new" class="btn btn-primary"
      ><AppIcon name="plus" :size="18" /> Add a book</RouterLink
    ></PageHeading
  >
  <section class="admin-panel">
    <div class="table-toolbar">
      <div class="search-field">
        <AppIcon name="search" :size="18" /><label for="admin-book-search" class="visually-hidden"
          >Search books</label
        ><input
          id="admin-book-search"
          v-model="search"
          class="form-control"
          type="search"
          placeholder="Search books…"
        />
      </div>
      <label for="admin-author-filter" class="visually-hidden">Filter by author</label
      ><select id="admin-author-filter" v-model="authorId" class="form-select">
        <option value="">All authors</option>
        <option v-for="author in authors.items" :key="author.id" :value="String(author.id)">
          {{ author.name }}
        </option></select
      ><span class="table-count">{{ filtered.length }} books</span>
    </div>
    <DataState
      :loading="loading"
      :error="error"
      :empty="!filtered.length"
      title="No books found"
      description="Add a book or try a different search to fill this shelf."
      @retry="load"
      ><div class="table-responsive">
        <table class="table library-table">
          <caption class="visually-hidden">
            Manage books in the collection
          </caption>
          <thead>
            <tr>
              <th scope="col">Book & author</th>
              <th scope="col">Genre</th>
              <th scope="col">Year</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in filtered" :key="book.id">
              <td>
                <div class="table-book">
                  <BookCover :book="book" :author="authorMap[book.authorId]?.name" />
                  <div>
                    <RouterLink :to="`/books/${book.id}`" class="table-title">{{
                      book.title
                    }}</RouterLink
                    ><span>{{ authorMap[book.authorId]?.name || 'Author unavailable' }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="table-tags">
                  <span v-for="tag in book.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</span
                  ><span v-if="!book.tags.length" class="muted">—</span>
                </div>
              </td>
              <td>{{ book.year }}</td>
              <td>
                <div class="table-actions">
                  <RouterLink
                    :to="`/admin/books/${book.id}/edit`"
                    class="icon-button"
                    :aria-label="`Edit ${book.title}`"
                    ><AppIcon name="edit" :size="17" /></RouterLink
                  ><button
                    class="icon-button delete-button"
                    :aria-label="`Delete ${book.title}`"
                    @click="selected = book"
                  >
                    <AppIcon name="trash" :size="17" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table></div
    ></DataState>
  </section>
  <ConfirmDialog
    :open="!!selected"
    title="Remove this book?"
    :message="deleteMessage"
    :busy="deleting"
    @cancel="selected = null"
    @confirm="confirmDelete"
  />
</template>
