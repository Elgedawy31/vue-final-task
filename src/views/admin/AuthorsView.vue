<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCatalog } from '../../composables/useCatalog'
import { useToastsStore } from '../../stores/toasts'
import { request } from '../../api'
import { formatDate } from '../../helpers'
import PageHeading from '../../components/PageHeading.vue'
import DataState from '../../components/DataState.vue'
import AuthorAvatar from '../../components/AuthorAvatar.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import AppIcon from '../../components/AppIcon.vue'
const { authors, books, loading, error, load } = useCatalog()
const toasts = useToastsStore()
const search = ref('')
const selected = ref(null)
const deleting = ref(false)
const filtered = computed(() =>
  authors.items.filter((author) =>
    author.name.toLowerCase().includes(search.value.trim().toLowerCase()),
  ),
)
const counts = computed(() =>
  books.items.reduce((result, book) => {
    result[book.authorId] = (result[book.authorId] || 0) + 1
    return result
  }, {}),
)
const deleteMessage = computed(
  () => `“${selected.value?.name}” will be removed from the library. This cannot be undone.`,
)
function selectAuthor(author) {
  if (counts.value[author.id]) {
    toasts.show('Reassign or remove this author’s books before deleting their profile.', 'error')
    return
  }
  selected.value = author
}
async function confirmDelete() {
  deleting.value = true
  try {
    const linked = await request(`/books?authorId=${encodeURIComponent(selected.value.id)}`)
    if (linked.length) {
      toasts.show('This author still has books. Reassign or remove them first.', 'error')
      selected.value = null
      await load()
      return
    }
    await authors.remove(selected.value.id)
    toasts.show('Author removed from the library.')
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
    eyebrow="THE STORYTELLERS"
    title="Your authors."
    description="Look after the people behind the pages."
    ><RouterLink to="/admin/authors/new" class="btn btn-primary"
      ><AppIcon name="plus" :size="18" /> Add an author</RouterLink
    ></PageHeading
  >
  <section class="admin-panel">
    <div class="table-toolbar">
      <div class="search-field">
        <AppIcon name="search" :size="18" /><label for="admin-author-search" class="visually-hidden"
          >Search authors</label
        ><input
          id="admin-author-search"
          v-model="search"
          class="form-control"
          type="search"
          placeholder="Search authors…"
        />
      </div>
      <span class="table-count">{{ filtered.length }} authors</span>
    </div>
    <DataState
      :loading="loading"
      :error="error"
      :empty="!filtered.length"
      title="No authors found"
      description="Welcome a new author to the collection or try another name."
      @retry="load"
      ><div class="table-responsive">
        <table class="table library-table">
          <caption class="visually-hidden">
            Manage authors in the library
          </caption>
          <thead>
            <tr>
              <th scope="col">Author</th>
              <th scope="col">Books</th>
              <th scope="col">Added</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="author in filtered" :key="author.id">
              <td>
                <div class="table-author">
                  <AuthorAvatar :author="author" />
                  <div>
                    <RouterLink :to="`/authors/${author.id}`" class="table-title">{{
                      author.name
                    }}</RouterLink
                    ><span class="author-bio-excerpt">{{ author.bio || 'No biography yet' }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="tag">{{ counts[author.id] || 0 }} books</span>
              </td>
              <td class="text-nowrap muted">{{ formatDate(author.createdAt) }}</td>
              <td>
                <div class="table-actions">
                  <RouterLink
                    :to="`/admin/authors/${author.id}/edit`"
                    class="icon-button"
                    :aria-label="`Edit ${author.name}`"
                    ><AppIcon name="edit" :size="17" /></RouterLink
                  ><button
                    class="icon-button delete-button"
                    :aria-label="`Delete ${author.name}`"
                    @click="selectAuthor(author)"
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
    title="Remove this author?"
    :message="deleteMessage"
    :busy="deleting"
    @cancel="selected = null"
    @confirm="confirmDelete"
  />
</template>
