<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBooksStore } from './books.js'
import { useAuthorsStore } from './authors.js'
import { useAuthStore } from './auth.js'
import AppIcon from './AppIcon.vue'
import BookCover from './BookCover.vue'
import AuthorAvatar from './AuthorAvatar.vue'
import DataState from './DataState.vue'

const route = useRoute()
const router = useRouter()
const bookStore = useBooksStore()
const authorStore = useAuthorsStore()
const auth = useAuthStore()
const open = ref(false)
const loading = ref(true)
const error = ref('')
const search = ref('')
const authorId = ref('')
const selected = ref(null)
const dialog = ref(null)
const deleting = ref(false)
const saving = ref(false)
const missing = ref(false)
const serverError = ref('')
const authorError = ref('')
const touched = reactive({})
const submitted = ref(false)
const currentYear = new Date().getFullYear()
const dashboard = computed(() => !route.meta.section)
const isBooks = computed(() => route.meta.section === 'books')
const formMode = computed(() => !!route.meta.form)
const editing = computed(() => !!route.params.id)
const section = computed(() => {
  if (dashboard.value) return 'Overview'
  if (isBooks.value) return 'Books'
  return 'Authors'
})
const links = [
  { to: '/admin', label: 'Overview', icon: 'grid' },
  { to: '/admin/books', label: 'Books', icon: 'book' },
  { to: '/admin/authors', label: 'Authors', icon: 'users' },
]
const bookForm = reactive({
  title: '',
  authorId: '',
  year: '',
  tags: '',
  coverUrl: '',
  description: '',
})
const authorForm = reactive({ name: '', bio: '', avatarUrl: '' })

const authorMap = computed(() => {
  const result = {}
  for (const author of authorStore.authors) {
    result[author.id] = author
  }
  return result
})
const recentBooks = computed(() => {
  const result = bookStore.books.slice()
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return result.slice(0, 4)
})
const genres = computed(() => {
  const result = []
  for (const book of bookStore.books) {
    for (const tag of book.tags) {
      if (!result.includes(tag)) result.push(tag)
    }
  }
  return result.sort()
})
const counts = computed(() => {
  const result = {}
  for (const book of bookStore.books) result[book.authorId] = (result[book.authorId] || 0) + 1
  return result
})
const filtered = computed(() => {
  if (isBooks.value) {
    return bookStore.books.filter(book =>
      book.title.toLowerCase().includes(search.value.trim().toLowerCase()) &&
      (!authorId.value || String(book.authorId) === authorId.value)
    )
  }
  return authorStore.authors.filter(author => author.name.toLowerCase().includes(search.value.trim().toLowerCase()))
})
const deleteMessage = computed(() => {
  if (!selected.value) return ''
  const name = selected.value.title || selected.value.name
  return `“${name}” will be removed from the library. This cannot be undone.`
})
const errors = computed(() => {
  if (isBooks.value) {
    return validateBook(bookForm, authorStore.authors, bookStore.books, route.params.id)
  }
  return validateAuthor(authorForm)
})
const valid = computed(() => Object.keys(errors.value).length === 0)
const canSubmit = computed(() => valid.value && !authorError.value && !saving.value && !loading.value)
const authorFieldError = computed(() => authorError.value || fieldError('authorId'))
const bookPreview = computed(() => ({
  title: bookForm.title || 'Your next great story',
  coverUrl: bookForm.coverUrl,
  tags: parseTags(bookForm.tags),
}))
const authorPreview = computed(() => ({
  name: authorForm.name || 'Your storyteller',
  avatarUrl: authorForm.avatarUrl,
}))
const previewAuthor = computed(() => {
  const author = authorMap.value[bookForm.authorId]
  if (author) return author.name
  return 'Author name'
})
const stats = computed(() => [
  { label: 'Books in the collection', value: bookStore.books.length, icon: 'book', link: '/admin/books', text: 'Manage books' },
  { label: 'Authors in the library', value: authorStore.authors.length, icon: 'users', link: '/admin/authors', text: 'Meet your authors' },
  { label: 'Genres to explore', value: genres.value.length, icon: 'bookmark', link: '/books', text: 'Explore the collection' },
])
const topGenres = computed(() => {
  const result = []
  for (const name of genres.value) {
    let count = 0
    for (const book of bookStore.books) {
      if (book.tags.includes(name)) count++
    }
    let percentage = 0
    if (bookStore.books.length > 0) percentage = count / bookStore.books.length * 100
    result.push({ name: name, count: count, width: percentage + '%' })
  }
  result.sort((a, b) => b.count - a.count)
  return result.slice(0, 5)
})

async function load() {
  loading.value = true
  error.value = ''
  missing.value = false
  try {
    await bookStore.getBooks()
    await authorStore.getAuthors()
    if (formMode.value && editing.value) {
      if (isBooks.value) {
        const book = await bookStore.getBook(route.params.id)
        bookForm.title = book.title
        bookForm.authorId = String(book.authorId)
        bookForm.year = book.year
        bookForm.tags = book.tags.join(', ')
        bookForm.coverUrl = book.coverUrl
        bookForm.description = book.description
      } else {
        const author = await authorStore.getAuthor(route.params.id)
        authorForm.name = author.name
        authorForm.bio = author.bio
        authorForm.avatarUrl = author.avatarUrl
      }
    }
  } catch (failure) {
    if (failure.status === 404 && editing.value) missing.value = true
    else error.value = failure.message
  } finally {
    loading.value = false
  }
}

function isActive(path) {
  return path === '/admin' ? route.path === path : route.path.startsWith(path)
}
function logout() {
  auth.logout()
  router.replace('/login')
}
function touch(field) {
  touched[field] = true
}
function fieldError(field) {
  if (!touched[field] && !submitted.value) return ''
  return errors.value[field] || ''
}
function changeAuthor() {
  authorError.value = ''
  touch('authorId')
}
function formatDate(value) {
  return new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function saveBook() {
  submitted.value = true
  if (!canSubmit.value) return
  saving.value = true
  serverError.value = ''
  try {
    await authorStore.getAuthor(bookForm.authorId)
    await bookStore.getBooks()
    if (!valid.value) return
    const book = {
      title: bookForm.title.trim(),
      authorId: bookForm.authorId,
      year: Number(bookForm.year),
      tags: parseTags(bookForm.tags),
      coverUrl: bookForm.coverUrl.trim(),
      description: bookForm.description.trim(),
    }
    if (editing.value) {
      await bookStore.editBook(route.params.id, book)
    } else {
      await bookStore.addBook(book)
    }
    auth.show('Book saved.')
    router.push('/admin/books')
  } catch (err) {
    if (err.status === 404) {
      authorError.value = 'This author no longer exists. Choose another author.'
    } else {
      serverError.value = err.message
      auth.show(err.message, 'error')
    }
  } finally {
    saving.value = false
  }
}

async function saveAuthor() {
  submitted.value = true
  if (!canSubmit.value) return
  saving.value = true
  serverError.value = ''
  try {
    const author = {
      name: authorForm.name.trim(),
      bio: authorForm.bio.trim(),
      avatarUrl: authorForm.avatarUrl.trim(),
    }
    if (editing.value) {
      await authorStore.editAuthor(route.params.id, author)
    } else {
      await authorStore.addAuthor(author)
    }
    auth.show('Author saved.')
    router.push('/admin/authors')
  } catch (err) {
    serverError.value = err.message
    auth.show(err.message, 'error')
  } finally {
    saving.value = false
  }
}

function showDelete(item) {
  selected.value = item
  dialog.value.showModal()
}
function selectAuthor(author) {
  if (counts.value[author.id]) {
    auth.show('Reassign or remove this author’s books before deleting their profile.', 'error')
    return
  }
  showDelete(author)
}
function cancelDelete() {
  if (deleting.value) return
  dialog.value.close()
  selected.value = null
}
async function confirmDelete() {
  deleting.value = true
  try {
    if (isBooks.value) {
      await bookStore.deleteBook(selected.value.id)
    } else {
      await bookStore.getBooks()
      if (bookStore.books.some(book => String(book.authorId) === String(selected.value.id))) {
        auth.show('This author still has books. Reassign or remove them first.', 'error')
        return
      }
      await authorStore.deleteAuthor(selected.value.id)
    }
    auth.show('Removed from the library.')
    dialog.value.close()
    selected.value = null
  } catch (failure) {
    auth.show(failure.message, 'error')
  } finally {
    deleting.value = false
  }
}
onMounted(load)

function isValidUrl(value) {
  if (!value?.trim()) return true
  try {
    return ['http:', 'https:'].includes(new URL(value.trim()).protocol)
  } catch {
    return false
  }
}

function parseTags(value) {
  const tags = []
  for (const word of value.split(',')) {
    const tag = word.trim().toLowerCase()
    if (tag) tags.push(tag)
  }
  return tags
}

function validateAuthor(values) {
  const errors = {}
  const name = values.name.trim()
  if (name.length < 2 || name.length > 60) errors.name = 'Enter a name between 2 and 60 characters.'
  if (values.bio.length > 800) errors.bio = 'Keep the biography to 800 characters or fewer.'
  if (!isValidUrl(values.avatarUrl)) errors.avatarUrl = 'Enter a valid http or https URL.'
  return errors
}

function validateBook(values, authors, books, currentId) {
  const errors = {}
  const title = values.title.trim()
  if (title.length < 3 || title.length > 100) {
    errors.title = 'Enter a title between 3 and 100 characters.'
  }

  let authorExists = false
  for (const author of authors) {
    if (String(author.id) === String(values.authorId)) authorExists = true
  }
  if (!authorExists) errors.authorId = 'Choose an existing author.'

  const year = Number(values.year)
  if (!Number.isInteger(year) || year < 1800 || year > currentYear) {
    errors.year = `Enter a year from 1800 to ${currentYear}.`
  }

  const tags = parseTags(values.tags)
  if (tags.length > 8) errors.tags = 'Use no more than 8 tags.'
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].length < 2 || tags[i].length > 20) {
      errors.tags = 'Each tag needs between 2 and 20 characters.'
    }
    if (tags.indexOf(tags[i]) !== i) errors.tags = 'Each tag should be unique.'
  }

  if (!isValidUrl(values.coverUrl)) errors.coverUrl = 'Enter a valid http or https URL.'
  if (values.description.length > 2000) {
    errors.description = 'Keep the description to 2,000 characters or fewer.'
  }

  for (const book of books) {
    if (String(book.id) === String(currentId)) continue
    if (String(book.authorId) !== String(values.authorId)) continue
    if (book.title.trim().toLowerCase() === title.toLowerCase()) {
      errors.title = 'This author already has a book with this title.'
    }
  }
  return errors
}

</script>

<template>
  <div class="admin-shell d-flex min-vh-100 bg-body-tertiary">
    <aside
      class="admin-sidebar position-fixed border-end pt-4 pb-3 flex-column px-3 px-lg-4 bg-body-tertiary"
      :class="{ 'is-open': open }"
    >
      <RouterLink
        to="/"
        class="brand text-decoration-none d-inline-flex align-items-center gap-2 ps-3"
        ><span class="brand-icon text-primary d-flex align-items-center"
          ><AppIcon class="flex-shrink-0" name="book" :size="25"
        /></span>
        folio<span class="brand-dot">.</span></RouterLink
      >
      <p
        class="sidebar-label mt-5 me-0 mb-3 ms-3 fw-bold small text-body-secondary"
      >
        YOUR WORKSPACE
      </p>
      <nav class="d-flex flex-column gap-1" aria-label="Dashboard navigation">
        <RouterLink
          class="text-decoration-none align-items-center gap-2 rounded-1 p-3 small"
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="{ 'is-active': isActive(link.to) }"
          ><AppIcon class="flex-shrink-0" :name="link.icon" :size="19" />
          {{ link.label }}</RouterLink
        >
      </nav>
      <div class="sidebar-bottom mt-auto">
        <div
          class="sidebar-tip mt-4 mb-3 rounded-2 mx-1 p-3 text-body-secondary"
        >
          <AppIcon name="leaf" :size="26" />
          <p class="mt-3 mb-0 mx-0 fs-5">
            A well-kept library.<br />A world of possibility.
          </p>
        </div>
        <RouterLink
          to="/"
          class="sidebar-link text-decoration-none d-flex align-items-center gap-2 border-0 bg-transparent w-100 py-2 px-3 small"
          ><AppIcon class="flex-shrink-0" name="globe" :size="18" /> View public
          site
          <AppIcon
            class="flex-shrink-0 ms-auto"
            name="arrow"
            :size="16" /></RouterLink
        ><button
          class="sidebar-link d-flex align-items-center gap-2 text-body-secondary border-0 bg-transparent w-100 py-2 px-3 small"
          @click="logout"
        >
          <AppIcon class="flex-shrink-0" name="logout" :size="18" /> Sign out
        </button>
      </div>
    </aside>
    <button
      v-if="open"
      class="sidebar-backdrop"
      aria-label="Close dashboard menu"
      @click="open = false"
    ></button>
    <div class="admin-main d-flex flex-column">
      <header
        class="admin-topbar border-bottom d-flex justify-content-between align-items-center py-0 px-3 px-md-4 px-xl-5 bg-body-tertiary small"
      >
        <div class="d-flex align-items-center gap-3">
          <button
            class="icon-button admin-menu-toggle d-inline-flex d-md-none align-items-center justify-content-center border-0 rounded-1 p-2"
            aria-label="Toggle dashboard menu"
            :aria-expanded="open"
            @click="open = !open"
          >
            <AppIcon class="flex-shrink-0" name="menu" /></button
          ><span class="muted text-body-secondary">Workspace</span
          ><AppIcon name="chevron" :size="14" /><span>{{ section }}</span>
        </div>
        <div class="admin-user d-flex align-items-center gap-2">
          <span class="user-avatar">A</span>
          <div>
            <strong class="d-block fw-semibold small">Library admin</strong
            ><span class="d-block text-body-secondary small"
              >Folio workspace</span
            >
          </div>
        </div>
      </header>
      <div class="admin-content px-3 py-4 px-md-4">
        <template v-if="dashboard">
          <div
            class="page-heading d-flex justify-content-between gap-3 gap-lg-4 align-items-end align-items-md-center mb-4"
          >
            <div>
              <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
                YOUR LIBRARY AT A GLANCE
              </p>
              <h1 class="fw-normal mb-3">Welcome back, curator.</h1>
              <p class="page-description text-body-secondary m-0 small">
                A little care for the stories that matter.
              </p>
            </div>
            <div class="heading-actions flex-shrink-0">
              <RouterLink
                to="/admin/books/new"
                class="btn btn-primary text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 gap-md-2 fw-semibold rounded-1 shadow-none p-2 px-md-3 small"
                ><AppIcon class="flex-shrink-0" name="plus" :size="18" /> Add a
                book</RouterLink
              >
            </div>
          </div>
          <DataState :loading="loading" :error="error" @retry="load"
            ><div class="row g-4 stat-row mb-4">
              <div v-for="stat in stats" :key="stat.label" class="col-md-4">
                <article
                  class="stat-card border rounded-2 py-3 px-4 px-md-3 p-xl-4 bg-body-tertiary"
                >
                  <div
                    class="stat-label d-flex align-items-center align-items-md-start align-items-lg-center justify-content-between text-body-secondary gap-2 small"
                  >
                    {{ stat.label
                    }}<span
                      class="stat-icon d-inline-flex rounded-2 align-items-center justify-content-center text-body-secondary"
                      ><AppIcon :name="stat.icon" :size="21"
                    /></span>
                  </div>
                  <strong
                    class="stat-value d-block fw-normal mt-0 mt-md-2 mb-2 mb-md-3 mx-0"
                    >{{ stat.value.toString().padStart(2, '0') }}</strong
                  ><RouterLink
                    :to="stat.link"
                    class="text-link text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold border-0 bg-transparent p-0 small"
                    >{{ stat.text }}
                    <AppIcon class="flex-shrink-0" name="arrow" :size="15"
                  /></RouterLink>
                </article>
              </div>
            </div>
            <div class="row g-4">
              <div class="col-xl-8">
                <section
                  class="admin-panel border rounded-2 overflow-hidden bg-body-tertiary"
                >
                  <div
                    class="panel-heading d-flex justify-content-between align-items-center pt-4 pb-3 px-4"
                  >
                    <div>
                      <h2 class="fw-semibold mt-0 mb-1 mx-0 fs-6">
                        Recently added
                      </h2>
                      <p class="text-body-secondary m-0 small">
                        The newest chapters in your collection.
                      </p>
                    </div>
                    <RouterLink
                      to="/admin/books"
                      class="text-link text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold border-0 bg-transparent p-0 small"
                      >View all
                      <AppIcon class="flex-shrink-0" name="arrow" :size="16"
                    /></RouterLink>
                  </div>
                  <DataState
                    :empty="!recentBooks.length"
                    title="Start your collection"
                    description="Add your first book to bring this shelf to life."
                    ><div class="table-responsive">
                      <table class="table library-table m-0 small">
                        <caption class="visually-hidden">
                          Recently added books
                        </caption>
                        <thead class="position-sticky">
                          <tr>
                            <th
                              class="border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                              scope="col"
                            >
                              Book
                            </th>
                            <th
                              class="border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                              scope="col"
                            >
                              Genre
                            </th>
                            <th
                              class="border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                              scope="col"
                            >
                              Added
                            </th>
                            <th
                              class="border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                              scope="col"
                            >
                              <span class="visually-hidden">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="book in recentBooks" :key="book.id">
                            <td class="align-middle border-bottom-0 p-3">
                              <div
                                class="table-book d-flex align-items-center gap-2"
                              >
                                <BookCover
                                  :book="book"
                                  :author="authorMap[book.authorId]?.name"
                                />
                                <div>
                                  <RouterLink
                                    :to="`/books/${book.id}`"
                                    class="table-title text-decoration-none fw-semibold d-block small"
                                    >{{ book.title }}</RouterLink
                                  ><span
                                    class="text-body-secondary d-block mt-1 small"
                                    >{{ authorMap[book.authorId]?.name }}</span
                                  >
                                </div>
                              </div>
                            </td>
                            <td class="align-middle border-bottom-0 p-3">
                              <span
                                class="tag d-inline-flex rounded-1 text-capitalize text-nowrap py-1 px-2 small"
                                >{{ book.tags[0] || 'Literature' }}</span
                              >
                            </td>
                            <td
                              class="text-nowrap muted text-body-secondary align-middle border-bottom-0 p-3"
                            >
                              {{ formatDate(book.createdAt) }}
                            </td>
                            <td class="align-middle border-bottom-0 p-3">
                              <RouterLink
                                :to="`/admin/books/${book.id}/edit`"
                                class="icon-button text-decoration-none d-inline-flex align-items-center justify-content-center border-0 rounded-1 p-2"
                                :aria-label="`Edit ${book.title}`"
                                ><AppIcon
                                  class="flex-shrink-0"
                                  name="edit"
                                  :size="17"
                              /></RouterLink>
                            </td>
                          </tr>
                        </tbody>
                      </table></div
                  ></DataState>
                </section>
              </div>
              <div class="col-xl-4">
                <section
                  class="admin-panel genre-panel border rounded-2 overflow-hidden h-100 p-4 bg-body-tertiary"
                >
                  <h2 class="fw-semibold mt-0 mb-1 mx-0 fs-6">
                    A world of genres
                  </h2>
                  <p class="muted small mt-0 text-body-secondary mx-0">
                    The stories that fill your shelves.
                  </p>
                  <div
                    v-for="genre in topGenres"
                    :key="genre.name"
                    class="genre-meter mt-4"
                  >
                    <div
                      class="d-flex justify-content-between text-capitalize mb-2 small"
                    >
                      <span>{{ genre.name }}</span
                      ><strong class="fw-medium text-body-secondary">{{
                        genre.count
                      }}</strong>
                    </div>
                    <div class="meter-track rounded-1 overflow-hidden">
                      <span
                        class="d-block h-100 rounded-1"
                        :style="{ width: genre.width }"
                      ></span>
                    </div>
                  </div>
                  <p
                    v-if="!topGenres.length"
                    class="muted mt-0 text-body-secondary mx-0"
                  >
                    Add tags to your books to see your genres here.
                  </p>
                </section>
              </div>
            </div>
            <section
              class="dashboard-note d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 border rounded-2 mt-4 p-3 p-lg-4"
            >
              <span
                class="feature-icon rounded-3 d-inline-flex align-items-center justify-content-center m-0"
                ><AppIcon name="sparkles" :size="24"
              /></span>
              <div>
                <h3 class="fw-normal mb-1 fs-4">
                  There’s more to every story.
                </h3>
                <p class="text-body-secondary m-0 small">
                  Open a book or author page to explore it with the reading
                  assistant.
                </p>
              </div>
              <RouterLink
                to="/books"
                class="text-link text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold border-0 bg-transparent ms-lg-auto text-nowrap p-0 small"
                >Take a look
                <AppIcon class="flex-shrink-0" name="arrow" :size="17"
              /></RouterLink></section
          ></DataState>
        </template>
        <template v-else-if="isBooks && !formMode">
          <div
            class="page-heading d-flex justify-content-between gap-3 gap-lg-4 align-items-end align-items-md-center mb-4"
          >
            <div>
              <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
                THE COLLECTION
              </p>
              <h1 class="fw-normal mb-3">Your books.</h1>
              <p class="page-description text-body-secondary m-0 small">
                Every great library starts with a well-kept shelf.
              </p>
            </div>
            <div class="heading-actions flex-shrink-0">
              <RouterLink
                to="/admin/books/new"
                class="btn btn-primary text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 gap-md-2 fw-semibold rounded-1 shadow-none p-2 px-md-3 small"
                ><AppIcon class="flex-shrink-0" name="plus" :size="18" /> Add a
                book</RouterLink
              >
            </div>
          </div>
          <section
            class="admin-panel border rounded-2 overflow-hidden bg-body-tertiary"
          >
            <div
              class="table-toolbar d-flex gap-2 align-items-center border-bottom p-3 px-lg-4"
            >
              <div class="search-field position-relative">
                <AppIcon
                  class="position-absolute pe-none text-body-secondary"
                  name="search"
                  :size="18"
                /><label for="admin-book-search" class="visually-hidden"
                  >Search books</label
                ><input
                  id="admin-book-search"
                  v-model="search"
                  class="form-control ps-5 text-body pe-3 rounded-1 py-2 small"
                  type="search"
                  placeholder="Search books…"
                />
              </div>
              <label for="admin-author-filter" class="visually-hidden"
                >Filter by author</label
              ><select
                id="admin-author-filter"
                v-model="authorId"
                class="form-select text-body pe-4 ps-3 rounded-1 py-2 small"
              >
                <option value="">All authors</option>
                <option
                  v-for="author in authorStore.authors"
                  :key="author.id"
                  :value="String(author.id)"
                >
                  {{ author.name }}
                </option></select
              ><span
                class="table-count text-body-secondary ms-auto text-nowrap small"
                >{{ filtered.length }} books</span
              >
            </div>
            <DataState
              :loading="loading"
              :error="error"
              :empty="!filtered.length"
              title="No books found"
              description="Add a book or try a different search to fill this shelf."
              @retry="load"
              ><div class="table-responsive">
                <table class="table library-table m-0 small">
                  <caption class="visually-hidden">
                    Manage books in the collection
                  </caption>
                  <thead class="position-sticky">
                    <tr>
                      <th
                        class="border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                        scope="col"
                      >
                        Book & author
                      </th>
                      <th
                        class="border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                        scope="col"
                      >
                        Genre
                      </th>
                      <th
                        class="border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                        scope="col"
                      >
                        Year
                      </th>
                      <th
                        scope="col"
                        class="text-end border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="book in filtered" :key="book.id">
                      <td class="align-middle border-bottom-0 p-3">
                        <div class="table-book d-flex align-items-center gap-2">
                          <BookCover
                            :book="book"
                            :author="authorMap[book.authorId]?.name"
                          />
                          <div>
                            <RouterLink
                              :to="`/books/${book.id}`"
                              class="table-title text-decoration-none fw-semibold d-block small"
                              >{{ book.title }}</RouterLink
                            ><span
                              class="text-body-secondary d-block mt-1 small"
                              >{{
                                authorMap[book.authorId]?.name ||
                                'Author unavailable'
                              }}</span
                            >
                          </div>
                        </div>
                      </td>
                      <td class="align-middle border-bottom-0 p-3">
                        <div class="table-tags d-flex flex-wrap gap-1">
                          <span
                            v-for="tag in book.tags.slice(0, 2)"
                            :key="tag"
                            class="tag d-inline-flex rounded-1 text-capitalize text-nowrap py-1 px-2 small"
                            >{{ tag }}</span
                          ><span
                            v-if="!book.tags.length"
                            class="muted text-body-secondary"
                            >—</span
                          >
                        </div>
                      </td>
                      <td class="align-middle border-bottom-0 p-3">
                        {{ book.year }}
                      </td>
                      <td class="align-middle border-bottom-0 p-3">
                        <div
                          class="table-actions d-flex justify-content-end gap-1"
                        >
                          <RouterLink
                            :to="`/admin/books/${book.id}/edit`"
                            class="icon-button text-decoration-none d-inline-flex align-items-center justify-content-center border-0 rounded-1 p-2"
                            :aria-label="`Edit ${book.title}`"
                            ><AppIcon
                              class="flex-shrink-0"
                              name="edit"
                              :size="17" /></RouterLink
                          ><button
                            class="icon-button delete-button d-inline-flex align-items-center justify-content-center border-0 rounded-1 p-2"
                            :aria-label="`Delete ${book.title}`"
                            @click="showDelete(book)"
                          >
                            <AppIcon
                              class="flex-shrink-0"
                              name="trash"
                              :size="17"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table></div
            ></DataState>
          </section>
        </template>
        <template v-else-if="!isBooks && !formMode">
          <div
            class="page-heading d-flex justify-content-between gap-3 gap-lg-4 align-items-end align-items-md-center mb-4"
          >
            <div>
              <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
                THE STORYTELLERS
              </p>
              <h1 class="fw-normal mb-3">Your authors.</h1>
              <p class="page-description text-body-secondary m-0 small">
                Look after the people behind the pages.
              </p>
            </div>
            <div class="heading-actions flex-shrink-0">
              <RouterLink
                to="/admin/authors/new"
                class="btn btn-primary text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 gap-md-2 fw-semibold rounded-1 shadow-none p-2 px-md-3 small"
                ><AppIcon class="flex-shrink-0" name="plus" :size="18" /> Add an
                author</RouterLink
              >
            </div>
          </div>
          <section
            class="admin-panel border rounded-2 overflow-hidden bg-body-tertiary"
          >
            <div
              class="table-toolbar d-flex gap-2 align-items-center border-bottom p-3 px-lg-4"
            >
              <div class="search-field position-relative">
                <AppIcon
                  class="position-absolute pe-none text-body-secondary"
                  name="search"
                  :size="18"
                /><label for="admin-author-search" class="visually-hidden"
                  >Search authors</label
                ><input
                  id="admin-author-search"
                  v-model="search"
                  class="form-control ps-5 text-body pe-3 rounded-1 py-2 small"
                  type="search"
                  placeholder="Search authors…"
                />
              </div>
              <span
                class="table-count text-body-secondary ms-auto text-nowrap small"
                >{{ filtered.length }} authors</span
              >
            </div>
            <DataState
              :loading="loading"
              :error="error"
              :empty="!filtered.length"
              title="No authors found"
              description="Welcome a new author to the collection or try another name."
              @retry="load"
              ><div class="table-responsive">
                <table class="table library-table m-0 small">
                  <caption class="visually-hidden">
                    Manage authors in the library
                  </caption>
                  <thead class="position-sticky">
                    <tr>
                      <th
                        class="border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                        scope="col"
                      >
                        Author
                      </th>
                      <th
                        class="border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                        scope="col"
                      >
                        Books
                      </th>
                      <th
                        class="border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                        scope="col"
                      >
                        Added
                      </th>
                      <th
                        scope="col"
                        class="text-end border-top fw-medium text-nowrap py-2 px-3 bg-body-tertiary text-body-secondary small"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="author in filtered" :key="author.id">
                      <td class="align-middle border-bottom-0 p-3">
                        <div
                          class="table-author d-flex align-items-center gap-2"
                        >
                          <AuthorAvatar :author="author" />
                          <div>
                            <RouterLink
                              :to="`/authors/${author.id}`"
                              class="table-title text-decoration-none fw-semibold d-block small"
                              >{{ author.name }}</RouterLink
                            ><span
                              class="author-bio-excerpt text-body-secondary d-block mt-1 overflow-hidden text-nowrap small"
                              >{{ author.bio || 'No biography yet' }}</span
                            >
                          </div>
                        </div>
                      </td>
                      <td class="align-middle border-bottom-0 p-3">
                        <span
                          class="tag d-inline-flex rounded-1 text-capitalize text-nowrap py-1 px-2 small"
                          >{{ counts[author.id] || 0 }} books</span
                        >
                      </td>
                      <td
                        class="text-nowrap muted text-body-secondary align-middle border-bottom-0 p-3"
                      >
                        {{ formatDate(author.createdAt) }}
                      </td>
                      <td class="align-middle border-bottom-0 p-3">
                        <div
                          class="table-actions d-flex justify-content-end gap-1"
                        >
                          <RouterLink
                            :to="`/admin/authors/${author.id}/edit`"
                            class="icon-button text-decoration-none d-inline-flex align-items-center justify-content-center border-0 rounded-1 p-2"
                            :aria-label="`Edit ${author.name}`"
                            ><AppIcon
                              class="flex-shrink-0"
                              name="edit"
                              :size="17" /></RouterLink
                          ><button
                            class="icon-button delete-button d-inline-flex align-items-center justify-content-center border-0 rounded-1 p-2"
                            :aria-label="`Delete ${author.name}`"
                            @click="selectAuthor(author)"
                          >
                            <AppIcon
                              class="flex-shrink-0"
                              name="trash"
                              :size="17"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table></div
            ></DataState>
          </section>
        </template>
        <template v-else-if="isBooks">
          <RouterLink
            to="/admin/books"
            class="back-link text-decoration-none d-inline-flex align-items-center gap-2 mb-4 small"
            ><AppIcon class="flex-shrink-0" name="back" :size="17" /> Back to
            books</RouterLink
          >
          <div
            class="page-heading d-flex justify-content-between gap-3 gap-lg-4 align-items-end align-items-md-center mb-4"
          >
            <div>
              <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
                THE COLLECTION
              </p>
              <h1 class="fw-normal mb-3">
                {{ editing ? 'A fresh edit.' : 'Make room for a new story.' }}
              </h1>
              <p class="page-description text-body-secondary m-0 small">
                {{
                  editing
                    ? 'Keep the details of this book up to date.'
                    : 'Add a book and help a reader find their next favorite.'
                }}
              </p>
            </div>
          </div>
          <DataState
            :loading="loading"
            :error="error"
            :empty="missing"
            title="Book not found"
            description="This book may have been removed from the collection."
            @retry="load"
            ><div class="form-layout row g-4 align-items-start">
              <div class="col-lg-9">
                <form
                  class="admin-panel editor-form border rounded-2 overflow-hidden px-3 py-4 px-md-4 bg-body-tertiary"
                  novalidate
                  @submit.prevent="saveBook"
                >
                  <div
                    class="form-section-heading d-flex align-items-center gap-2 border-bottom pb-3 mb-4 text-body-secondary"
                  >
                    <AppIcon name="book" :size="21" />
                    <h2 class="fw-semibold text-body m-0 small">
                      Book details
                    </h2>
                    <span class="ms-auto text-body-secondary small"
                      >* Required fields</span
                    >
                  </div>
                  <div
                    v-if="!authorStore.authors.length"
                    class="form-notice border mb-3 rounded-1 p-3 bg-body-tertiary small text-body-secondary"
                  >
                    Every book needs an author.
                    <RouterLink
                      class="text-decoration-underline"
                      to="/admin/authors/new"
                      >Add an author first.</RouterLink
                    >
                  </div>
                  <div class="form-field mb-4">
                    <label for="title" class="form-label fw-medium mb-2 small"
                      >Book title
                      <span class="required-mark ms-1">*</span></label
                    >
                    <input
                      id="title"
                      v-model="bookForm.title"
                      class="form-control text-body rounded-1 py-2 px-3 small"
                      :class="{ 'is-invalid': !!fieldError('title') }"
                      :aria-invalid="!!fieldError('title')"
                      :aria-describedby="'title-message'"
                      placeholder="e.g. Project Hail Mary"
                      required
                      @blur="touch('title')"
                    />
                    <p
                      v-if="fieldError('title')"
                      id="title-message"
                      class="field-error mt-2 mb-0 mx-0 small"
                    >
                      {{ fieldError('title') }}
                    </p>
                  </div>
                  <div class="row">
                    <div class="col-md-8">
                      <div class="form-field mb-4">
                        <label
                          for="authorId"
                          class="form-label fw-medium mb-2 small"
                          >Author
                          <span class="required-mark ms-1">*</span></label
                        >
                        <select
                          id="authorId"
                          v-model="bookForm.authorId"
                          class="form-select text-body pe-4 ps-3 rounded-1 py-2 small"
                          :class="{ 'is-invalid': !!authorFieldError }"
                          :aria-invalid="!!authorFieldError"
                          :aria-describedby="'authorId-message'"
                          required
                          @change="changeAuthor"
                          @blur="touch('authorId')"
                        >
                          <option value="" disabled>Select an author</option>
                          <option
                            v-for="author in authorStore.authors"
                            :key="author.id"
                            :value="String(author.id)"
                          >
                            {{ author.name }}
                          </option>
                        </select>
                        <p
                          v-if="authorFieldError"
                          id="authorId-message"
                          class="field-error mt-2 mb-0 mx-0 small"
                        >
                          {{ authorFieldError }}
                        </p>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-field mb-4">
                        <label
                          for="year"
                          class="form-label fw-medium mb-2 small"
                          >Publication year
                          <span class="required-mark ms-1">*</span></label
                        >
                        <input
                          id="year"
                          v-model="bookForm.year"
                          type="number"
                          min="1800"
                          :max="currentYear"
                          step="1"
                          class="form-control text-body rounded-1 py-2 px-3 small"
                          :class="{ 'is-invalid': !!fieldError('year') }"
                          :aria-invalid="!!fieldError('year')"
                          :aria-describedby="'year-message'"
                          placeholder="2021"
                          required
                          @blur="touch('year')"
                        />
                        <p
                          v-if="fieldError('year')"
                          id="year-message"
                          class="field-error mt-2 mb-0 mx-0 small"
                        >
                          {{ fieldError('year') }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="form-field mb-4">
                    <label for="tags" class="form-label fw-medium mb-2 small"
                      >Genres & tags
                      <span
                        class="optional-label fw-normal ms-1 text-body-secondary small"
                        >optional</span
                      ></label
                    >
                    <input
                      id="tags"
                      v-model="bookForm.tags"
                      class="form-control text-body rounded-1 py-2 px-3 small"
                      :class="{ 'is-invalid': !!fieldError('tags') }"
                      :aria-invalid="!!fieldError('tags')"
                      :aria-describedby="'tags-message'"
                      placeholder="e.g. science fiction, space"
                      @blur="touch('tags')"
                    />
                    <p
                      v-if="fieldError('tags')"
                      id="tags-message"
                      class="field-error mt-2 mb-0 mx-0 small"
                    >
                      {{ fieldError('tags') }}
                    </p>
                    <p
                      v-else
                      id="tags-message"
                      class="field-hint mt-2 mb-0 mx-0 small text-body-secondary"
                    >
                      Separate tags with commas. Up to 8 tags, 2–20 characters
                      each.
                    </p>
                  </div>
                  <div class="form-field mb-4">
                    <label
                      for="coverUrl"
                      class="form-label fw-medium mb-2 small"
                      >Cover image URL
                      <span
                        class="optional-label fw-normal ms-1 text-body-secondary small"
                        >optional</span
                      ></label
                    >
                    <input
                      id="coverUrl"
                      v-model="bookForm.coverUrl"
                      type="url"
                      class="form-control text-body rounded-1 py-2 px-3 small"
                      :class="{ 'is-invalid': !!fieldError('coverUrl') }"
                      :aria-invalid="!!fieldError('coverUrl')"
                      :aria-describedby="'coverUrl-message'"
                      placeholder="https://example.com/cover.jpg"
                      @blur="touch('coverUrl')"
                    />
                    <p
                      v-if="fieldError('coverUrl')"
                      id="coverUrl-message"
                      class="field-error mt-2 mb-0 mx-0 small"
                    >
                      {{ fieldError('coverUrl') }}
                    </p>
                    <p
                      v-else
                      id="coverUrl-message"
                      class="field-hint mt-2 mb-0 mx-0 small text-body-secondary"
                    >
                      Use a public http or https image URL. Leave blank for a
                      Folio cover.
                    </p>
                  </div>
                  <div class="form-field mb-4">
                    <label
                      for="description"
                      class="form-label fw-medium mb-2 small"
                      >Description
                      <span
                        class="optional-label fw-normal ms-1 text-body-secondary small"
                        >optional</span
                      ></label
                    >

                    <textarea
                      id="description"
                      v-model="bookForm.description"
                      rows="6"
                      class="form-control text-body rounded-1 py-2 px-3 small"
                      :class="{ 'is-invalid': !!fieldError('description') }"
                      :aria-invalid="!!fieldError('description')"
                      :aria-describedby="'description-message'"
                      placeholder="What is waiting between these covers?"
                      @blur="touch('description')"
                    ></textarea>

                    <p
                      v-if="fieldError('description')"
                      id="description-message"
                      class="field-error mt-2 mb-0 mx-0 small"
                    >
                      {{ fieldError('description') }}
                    </p>
                    <p
                      v-else
                      id="description-message"
                      class="field-hint mt-2 mb-0 mx-0 small text-body-secondary"
                    >
                      {{ `${bookForm.description.length} / 2,000 characters` }}
                    </p>
                  </div>
                  <p
                    v-if="serverError"
                    class="field-error mt-2 mb-0 mx-0 small"
                    role="alert"
                  >
                    {{ serverError }}
                  </p>
                  <div
                    class="form-actions d-flex justify-content-end gap-2 border-top pt-4 mt-4"
                  >
                    <RouterLink
                      to="/admin/books"
                      class="btn btn-outline-secondary text-decoration-none d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-3 small"
                      >Cancel</RouterLink
                    ><button
                      class="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-3 small"
                      :disabled="!canSubmit"
                    >
                      <span
                        v-if="saving"
                        class="spinner-border spinner-border-sm"
                      ></span
                      ><AppIcon
                        class="flex-shrink-0"
                        v-else
                        name="check"
                        :size="18"
                      />{{
                        saving
                          ? 'Saving…'
                          : editing
                            ? 'Save changes'
                            : 'Add book'
                      }}
                    </button>
                  </div>
                </form>
              </div>
              <div class="col-lg-3 d-none d-lg-block">
                <aside
                  class="form-preview rounded-2 text-center px-3 py-4 bg-body-tertiary"
                >
                  <p class="eyebrow mt-0 mb-4 d-block fw-bold mx-0 small">
                    A LOOK AT YOUR SHELF
                  </p>
                  <BookCover :book="bookPreview" :author="previewAuthor" />
                  <h3 class="fw-normal fs-4">{{ bookPreview.title }}</h3>
                  <p class="mt-0 text-body-secondary mx-0 small">
                    {{ previewAuthor }}
                  </p>
                  <div
                    class="detail-tags d-flex gap-2 flex-wrap justify-content-center mx-0 my-4"
                  >
                    <span
                      v-for="tag in bookPreview.tags"
                      :key="tag"
                      class="tag d-inline-flex rounded-1 text-capitalize text-nowrap py-1 px-2 small"
                      >{{ tag }}</span
                    >
                  </div>
                  <p
                    class="preview-note mt-4 mb-0 text-body-secondary border-top pt-3 mx-0 small"
                  >
                    <AppIcon
                      class="d-block mt-0 mb-2 mx-auto text-body-secondary"
                      name="leaf"
                      :size="17"
                    />
                    Every good story deserves a good introduction.
                  </p>
                </aside>
              </div>
            </div></DataState
          >
        </template>
        <template v-else-if="true">
          <RouterLink
            to="/admin/authors"
            class="back-link text-decoration-none d-inline-flex align-items-center gap-2 mb-4 small"
            ><AppIcon class="flex-shrink-0" name="back" :size="17" /> Back to
            authors</RouterLink
          >
          <div
            class="page-heading d-flex justify-content-between gap-3 gap-lg-4 align-items-end align-items-md-center mb-4"
          >
            <div>
              <p class="eyebrow mt-0 mb-2 d-block fw-bold mx-0 small">
                THE STORYTELLERS
              </p>
              <h1 class="fw-normal mb-3">
                {{ editing ? 'Refine their story.' : 'Welcome a new voice.' }}
              </h1>
              <p class="page-description text-body-secondary m-0 small">
                {{
                  editing
                    ? 'Keep this author’s profile up to date.'
                    : 'Introduce the person behind the pages.'
                }}
              </p>
            </div>
          </div>
          <DataState
            :loading="loading"
            :error="error"
            :empty="missing"
            title="Author not found"
            description="This author may have been removed from the library."
            @retry="load"
            ><div class="form-layout row g-4 align-items-start">
              <div class="col-lg-9">
                <form
                  class="admin-panel editor-form border rounded-2 overflow-hidden px-3 py-4 px-md-4 bg-body-tertiary"
                  novalidate
                  @submit.prevent="saveAuthor"
                >
                  <div
                    class="form-section-heading d-flex align-items-center gap-2 border-bottom pb-3 mb-4 text-body-secondary"
                  >
                    <AppIcon name="users" :size="21" />
                    <h2 class="fw-semibold text-body m-0 small">
                      Author details
                    </h2>
                    <span class="ms-auto text-body-secondary small"
                      >* Required fields</span
                    >
                  </div>
                  <div class="form-field mb-4">
                    <label for="name" class="form-label fw-medium mb-2 small"
                      >Full name
                      <span class="required-mark ms-1">*</span></label
                    >
                    <input
                      id="name"
                      v-model="authorForm.name"
                      class="form-control text-body rounded-1 py-2 px-3 small"
                      :class="{ 'is-invalid': !!fieldError('name') }"
                      :aria-invalid="!!fieldError('name')"
                      :aria-describedby="'name-message'"
                      placeholder="e.g. Andy Weir"
                      required
                      @blur="touch('name')"
                    />
                    <p
                      v-if="fieldError('name')"
                      id="name-message"
                      class="field-error mt-2 mb-0 mx-0 small"
                    >
                      {{ fieldError('name') }}
                    </p>
                  </div>
                  <div class="form-field mb-4">
                    <label
                      for="avatarUrl"
                      class="form-label fw-medium mb-2 small"
                      >Portrait URL
                      <span
                        class="optional-label fw-normal ms-1 text-body-secondary small"
                        >optional</span
                      ></label
                    >
                    <input
                      id="avatarUrl"
                      v-model="authorForm.avatarUrl"
                      type="url"
                      class="form-control text-body rounded-1 py-2 px-3 small"
                      :class="{ 'is-invalid': !!fieldError('avatarUrl') }"
                      :aria-invalid="!!fieldError('avatarUrl')"
                      :aria-describedby="'avatarUrl-message'"
                      placeholder="https://example.com/portrait.jpg"
                      @blur="touch('avatarUrl')"
                    />
                    <p
                      v-if="fieldError('avatarUrl')"
                      id="avatarUrl-message"
                      class="field-error mt-2 mb-0 mx-0 small"
                    >
                      {{ fieldError('avatarUrl') }}
                    </p>
                    <p
                      v-else
                      id="avatarUrl-message"
                      class="field-hint mt-2 mb-0 mx-0 small text-body-secondary"
                    >
                      Use a public http or https image URL. Leave blank to use
                      initials.
                    </p>
                  </div>
                  <div class="form-field mb-4">
                    <label for="bio" class="form-label fw-medium mb-2 small"
                      >Biography
                      <span
                        class="optional-label fw-normal ms-1 text-body-secondary small"
                        >optional</span
                      ></label
                    >

                    <textarea
                      id="bio"
                      v-model="authorForm.bio"
                      rows="8"
                      class="form-control text-body rounded-1 py-2 px-3 small"
                      :class="{ 'is-invalid': !!fieldError('bio') }"
                      :aria-invalid="!!fieldError('bio')"
                      :aria-describedby="'bio-message'"
                      placeholder="Tell us a little about their life, work, and the worlds they create…"
                      @blur="touch('bio')"
                    ></textarea>

                    <p
                      v-if="fieldError('bio')"
                      id="bio-message"
                      class="field-error mt-2 mb-0 mx-0 small"
                    >
                      {{ fieldError('bio') }}
                    </p>
                    <p
                      v-else
                      id="bio-message"
                      class="field-hint mt-2 mb-0 mx-0 small text-body-secondary"
                    >
                      {{ `${authorForm.bio.length} / 800 characters` }}
                    </p>
                  </div>
                  <p
                    v-if="serverError"
                    class="field-error mt-2 mb-0 mx-0 small"
                    role="alert"
                  >
                    {{ serverError }}
                  </p>
                  <div
                    class="form-actions d-flex justify-content-end gap-2 border-top pt-4 mt-4"
                  >
                    <RouterLink
                      to="/admin/authors"
                      class="btn btn-outline-secondary text-decoration-none d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-3 small"
                      >Cancel</RouterLink
                    ><button
                      class="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-3 small"
                      :disabled="!canSubmit"
                    >
                      <span
                        v-if="saving"
                        class="spinner-border spinner-border-sm"
                      ></span
                      ><AppIcon
                        class="flex-shrink-0"
                        v-else
                        name="check"
                        :size="18"
                      />{{
                        saving
                          ? 'Saving…'
                          : editing
                            ? 'Save changes'
                            : 'Add author'
                      }}
                    </button>
                  </div>
                </form>
              </div>
              <div class="col-lg-3 d-none d-lg-block">
                <aside
                  class="form-preview author-preview rounded-2 text-center px-3 py-4 bg-body-tertiary"
                >
                  <p class="eyebrow mt-0 mb-4 d-block fw-bold mx-0 small">
                    MEET YOUR STORYTELLER
                  </p>
                  <AuthorAvatar :author="authorPreview" />
                  <h3 class="fw-normal fs-4">{{ authorPreview.name }}</h3>
                  <p class="preview-bio mt-0 text-body-secondary mx-0 small">
                    {{ authorForm.bio || 'Their story starts here.' }}
                  </p>
                  <p
                    class="preview-note mt-4 mb-0 text-body-secondary border-top pt-3 mx-0 small"
                  >
                    <AppIcon
                      class="d-block mt-0 mb-2 mx-auto text-body-secondary"
                      name="leaf"
                      :size="17"
                    />
                    Behind every great book is a voice worth knowing.
                  </p>
                </aside>
              </div>
            </div></DataState
          >
        </template>
        <dialog
          ref="dialog"
          class="confirm-dialog border rounded-3 bg-body text-body p-4"
          aria-labelledby="delete-title"
          aria-describedby="delete-description"
          @cancel.prevent="cancelDelete"
        >
          <span
            class="delete-symbol d-inline-flex align-items-center justify-content-center rounded-circle mb-4 bg-body-tertiary"
            ><AppIcon name="trash" :size="25"
          /></span>
          <h2 class="fw-normal fs-3" id="delete-title">
            {{ isBooks ? 'Remove this book?' : 'Remove this author?' }}
          </h2>
          <p
            class="mt-3 mb-4 text-body-secondary mx-0 small"
            id="delete-description"
          >
            {{ deleteMessage }}
          </p>
          <div class="d-flex justify-content-end gap-2">
            <button
              autofocus
              class="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
              :disabled="deleting"
              @click="cancelDelete"
            >
              Keep it
            </button>
            <button
              class="btn btn-danger d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-1 shadow-none py-2 px-4 small"
              :disabled="deleting"
              @click="confirmDelete"
            >
              {{ deleting ? 'Deleting…' : 'Yes, delete' }}
            </button>
          </div>
        </dialog>
      </div>
      <footer
        class="admin-footer border-top d-flex justify-content-between p-3 px-md-4 small text-body-secondary"
      >
        Folio library workspace <span>One good story at a time.</span>
      </footer>
    </div>
  </div>
</template>
