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
<div class="admin-shell">
    <aside class="admin-sidebar" :class="{ 'is-open': open }">
      <RouterLink to="/" class="brand"
        ><span class="brand-icon"><AppIcon name="book" :size="25" /></span> folio<span
          class="brand-dot"
          >.</span
        ></RouterLink
      >
      <p class="sidebar-label">YOUR WORKSPACE</p>
      <nav aria-label="Dashboard navigation">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="{ 'is-active': isActive(link.to) }"
          ><AppIcon :name="link.icon" :size="19" /> {{ link.label }}</RouterLink
        >
      </nav>
      <div class="sidebar-bottom">
        <div class="sidebar-tip">
          <AppIcon name="leaf" :size="26" />
          <p>A well-kept library.<br />A world of possibility.</p>
        </div>
        <RouterLink to="/" class="sidebar-link"
          ><AppIcon name="globe" :size="18" /> View public site
          <AppIcon name="arrow" :size="16" /></RouterLink
        ><button class="sidebar-link" @click="logout">
          <AppIcon name="logout" :size="18" /> Sign out
        </button>
      </div>
    </aside>
    <button
      v-if="open"
      class="sidebar-backdrop"
      aria-label="Close dashboard menu"
      @click="open = false"
    ></button>
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="d-flex align-items-center gap-3">
          <button
            class="icon-button admin-menu-toggle"
            aria-label="Toggle dashboard menu"
            :aria-expanded="open"
            @click="open = !open"
          >
            <AppIcon name="menu" /></button
          ><span class="muted">Workspace</span><AppIcon name="chevron" :size="14" /><span>{{
            section
          }}</span>
        </div>
        <div class="admin-user">
          <span class="user-avatar">A</span>
          <div><strong>Library admin</strong><span>Folio workspace</span></div>
        </div>
      </header>
      <div class="admin-content">
<template v-if="dashboard">
<div class="page-heading"><div>
<p class="eyebrow">YOUR LIBRARY AT A GLANCE</p>
<h1>Welcome back, curator.</h1>
<p class="page-description">A little care for the stories that matter.</p>
</div>
<div class="heading-actions"><RouterLink to="/admin/books/new" class="btn btn-primary"
      ><AppIcon name="plus" :size="18" /> Add a book</RouterLink
    ></div></div><DataState :loading="loading" :error="error" @retry="load"
    ><div class="row g-4 stat-row">
      <div v-for="stat in stats" :key="stat.label" class="col-md-4">
        <article class="stat-card">
          <div class="stat-label">
            {{ stat.label }}<span class="stat-icon"><AppIcon :name="stat.icon" :size="21" /></span>
          </div>
          <strong class="stat-value">{{ stat.value.toString().padStart(2, '0') }}</strong
          ><RouterLink :to="stat.link" class="text-link"
            >{{ stat.text }} <AppIcon name="arrow" :size="15"
          /></RouterLink>
        </article>
      </div>
    </div>
    <div class="row g-4">
      <div class="col-xl-8">
        <section class="admin-panel">
          <div class="panel-heading">
            <div>
              <h2>Recently added</h2>
              <p>The newest chapters in your collection.</p>
            </div>
            <RouterLink to="/admin/books" class="text-link"
              >View all <AppIcon name="arrow" :size="16"
            /></RouterLink>
          </div>
          <DataState
            :empty="!recentBooks.length"
            title="Start your collection"
            description="Add your first book to bring this shelf to life."
            ><div class="table-responsive">
              <table class="table library-table">
                <caption class="visually-hidden">
                  Recently added books
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Book</th>
                    <th scope="col">Genre</th>
                    <th scope="col">Added</th>
                    <th scope="col"><span class="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in recentBooks" :key="book.id">
                    <td>
                      <div class="table-book">
                        <BookCover :book="book" :author="authorMap[book.authorId]?.name" />
                        <div>
                          <RouterLink :to="`/books/${book.id}`" class="table-title">{{
                            book.title
                          }}</RouterLink
                          ><span>{{ authorMap[book.authorId]?.name }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="tag">{{ book.tags[0] || 'Literature' }}</span>
                    </td>
                    <td class="text-nowrap muted">{{ formatDate(book.createdAt) }}</td>
                    <td>
                      <RouterLink
                        :to="`/admin/books/${book.id}/edit`"
                        class="icon-button"
                        :aria-label="`Edit ${book.title}`"
                        ><AppIcon name="edit" :size="17"
                      /></RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table></div
          ></DataState>
        </section>
      </div>
      <div class="col-xl-4">
        <section class="admin-panel genre-panel">
          <h2>A world of genres</h2>
          <p class="muted small">The stories that fill your shelves.</p>
          <div v-for="genre in topGenres" :key="genre.name" class="genre-meter">
            <div>
              <span>{{ genre.name }}</span
              ><strong>{{ genre.count }}</strong>
            </div>
            <div class="meter-track"><span :style="{ width: genre.width }"></span></div>
          </div>
          <p v-if="!topGenres.length" class="muted">
            Add tags to your books to see your genres here.
          </p>
        </section>
      </div>
    </div>
    <section class="dashboard-note">
      <span class="feature-icon"><AppIcon name="sparkles" :size="24" /></span>
      <div>
        <h3>There’s more to every story.</h3>
        <p>Open a book or author page to explore it with the reading assistant.</p>
      </div>
      <RouterLink to="/books" class="text-link"
        >Take a look <AppIcon name="arrow" :size="17"
      /></RouterLink></section
  ></DataState>
</template>
<template v-else-if="isBooks && !formMode">
<div class="page-heading"><div>
<p class="eyebrow">THE COLLECTION</p>
<h1>Your books.</h1>
<p class="page-description">Every great library starts with a well-kept shelf.</p>
</div>
<div class="heading-actions"><RouterLink to="/admin/books/new" class="btn btn-primary"
      ><AppIcon name="plus" :size="18" /> Add a book</RouterLink
    ></div></div>
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
        <option v-for="author in authorStore.authors" :key="author.id" :value="String(author.id)">
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
                    @click="showDelete(book)"
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
  
</template>
<template v-else-if="!isBooks && !formMode">
<div class="page-heading"><div>
<p class="eyebrow">THE STORYTELLERS</p>
<h1>Your authors.</h1>
<p class="page-description">Look after the people behind the pages.</p>
</div>
<div class="heading-actions"><RouterLink to="/admin/authors/new" class="btn btn-primary"
      ><AppIcon name="plus" :size="18" /> Add an author</RouterLink
    ></div></div>
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
  
</template>
<template v-else-if="isBooks">
<RouterLink to="/admin/books" class="back-link"
    ><AppIcon name="back" :size="17" /> Back to books</RouterLink
  ><div class="page-heading"><div>
<p class="eyebrow">THE COLLECTION</p>
<h1>{{ editing ? 'A fresh edit.' : 'Make room for a new story.' }}</h1>
<p class="page-description">{{ editing
        ? 'Keep the details of this book up to date.'
        : 'Add a book and help a reader find their next favorite.' }}</p>
</div></div><DataState
    :loading="loading"
    :error="error"
    :empty="missing"
    title="Book not found"
    description="This book may have been removed from the collection."
    @retry="load"
    ><div class="form-layout">
      <form class="admin-panel editor-form" novalidate @submit.prevent="saveBook">
        <div class="form-section-heading">
          <AppIcon name="book" :size="21" />
          <h2>Book details</h2>
          <span>* Required fields</span>
        </div>
        <div v-if="!authorStore.authors.length" class="form-notice">
          Every book needs an author.
          <RouterLink to="/admin/authors/new">Add an author first.</RouterLink>
        </div>
        <div class="form-field">
<label for="title" class="form-label">Book title <span class="required-mark">*</span></label>
<input
            id="title"
            v-model="bookForm.title"
            class="form-control"
            :class="{ 'is-invalid': !!fieldError('title') }"
            :aria-invalid="!!fieldError('title')"
            :aria-describedby="'title-message'"
            placeholder="e.g. Project Hail Mary"
            required
            @blur="touch('title')"
        />
<p v-if="fieldError('title')" id="title-message" class="field-error">{{ fieldError('title') }}</p>
</div>
        <div class="row">
          <div class="col-md-8">
            <div class="form-field">
<label for="authorId" class="form-label">Author <span class="required-mark">*</span></label>
<select
                id="authorId"
                v-model="bookForm.authorId"
                class="form-select"
                :class="{ 'is-invalid': !!authorFieldError }"
                :aria-invalid="!!authorFieldError"
                :aria-describedby="'authorId-message'"
                required
                @change="changeAuthor"
                @blur="touch('authorId')"
              >
                <option value="" disabled>Select an author</option>
                <option v-for="author in authorStore.authors" :key="author.id" :value="String(author.id)">
                  {{ author.name }}
                </option>
              </select>
<p v-if="authorFieldError" id="authorId-message" class="field-error">{{ authorFieldError }}</p>
</div>
          </div>
          <div class="col-md-4">
            <div class="form-field">
<label for="year" class="form-label">Publication year <span class="required-mark">*</span></label>
<input
                id="year"
                v-model="bookForm.year"
                type="number"
                min="1800"
                :max="currentYear"
                step="1"
                class="form-control"
                :class="{ 'is-invalid': !!fieldError('year') }"
                :aria-invalid="!!fieldError('year')"
                :aria-describedby="'year-message'"
                placeholder="2021"
                required
                @blur="touch('year')"
            />
<p v-if="fieldError('year')" id="year-message" class="field-error">{{ fieldError('year') }}</p>
</div>
          </div>
        </div>
        <div class="form-field">
<label for="tags" class="form-label">Genres & tags <span class="optional-label">optional</span></label>
<input
            id="tags"
            v-model="bookForm.tags"
            class="form-control"
            :class="{ 'is-invalid': !!fieldError('tags') }"
            :aria-invalid="!!fieldError('tags')"
            :aria-describedby="'tags-message'"
            placeholder="e.g. science fiction, space"
            @blur="touch('tags')" />
<p v-if="fieldError('tags')" id="tags-message" class="field-error">{{ fieldError('tags') }}</p>
<p v-else id="tags-message" class="field-hint">Separate tags with commas. Up to 8 tags, 2–20 characters each.</p>
</div><div class="form-field">
<label for="coverUrl" class="form-label">Cover image URL <span class="optional-label">optional</span></label>
<input
            id="coverUrl"
            v-model="bookForm.coverUrl"
            type="url"
            class="form-control"
            :class="{ 'is-invalid': !!fieldError('coverUrl') }"
            :aria-invalid="!!fieldError('coverUrl')"
            :aria-describedby="'coverUrl-message'"
            placeholder="https://example.com/cover.jpg"
            @blur="touch('coverUrl')" />
<p v-if="fieldError('coverUrl')" id="coverUrl-message" class="field-error">{{ fieldError('coverUrl') }}</p>
<p v-else id="coverUrl-message" class="field-hint">Use a public http or https image URL. Leave blank for a Folio cover.</p>
</div><div class="form-field">
<label for="description" class="form-label">Description <span class="optional-label">optional</span></label>

          <textarea
            id="description"
            v-model="bookForm.description"
            rows="6"
            class="form-control"
            :class="{ 'is-invalid': !!fieldError('description') }"
            :aria-invalid="!!fieldError('description')"
            :aria-describedby="'description-message'"
            placeholder="What is waiting between these covers?"
            @blur="touch('description')"
          ></textarea>
        
<p v-if="fieldError('description')" id="description-message" class="field-error">{{ fieldError('description') }}</p>
<p v-else id="description-message" class="field-hint">{{ `${bookForm.description.length} / 2,000 characters` }}</p>
</div>
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
        <BookCover :book="bookPreview" :author="previewAuthor" />
        <h3>{{ bookPreview.title }}</h3>
        <p>{{ previewAuthor }}</p>
        <div class="detail-tags">
          <span v-for="tag in bookPreview.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <p class="preview-note">
          <AppIcon name="leaf" :size="17" /> Every good story deserves a good introduction.
        </p>
      </aside>
    </div></DataState
  >
</template>
<template v-else-if="true">
<RouterLink to="/admin/authors" class="back-link"
    ><AppIcon name="back" :size="17" /> Back to authors</RouterLink
  ><div class="page-heading"><div>
<p class="eyebrow">THE STORYTELLERS</p>
<h1>{{ editing ? 'Refine their story.' : 'Welcome a new voice.' }}</h1>
<p class="page-description">{{ editing ? 'Keep this author’s profile up to date.' : 'Introduce the person behind the pages.' }}</p>
</div></div><DataState
    :loading="loading"
    :error="error"
    :empty="missing"
    title="Author not found"
    description="This author may have been removed from the library."
    @retry="load"
    ><div class="form-layout">
      <form class="admin-panel editor-form" novalidate @submit.prevent="saveAuthor">
        <div class="form-section-heading">
          <AppIcon name="users" :size="21" />
          <h2>Author details</h2>
          <span>* Required fields</span>
        </div>
        <div class="form-field">
<label for="name" class="form-label">Full name <span class="required-mark">*</span></label>
<input
            id="name"
            v-model="authorForm.name"
            class="form-control"
            :class="{ 'is-invalid': !!fieldError('name') }"
            :aria-invalid="!!fieldError('name')"
            :aria-describedby="'name-message'"
            placeholder="e.g. Andy Weir"
            required
            @blur="touch('name')" />
<p v-if="fieldError('name')" id="name-message" class="field-error">{{ fieldError('name') }}</p>
</div><div class="form-field">
<label for="avatarUrl" class="form-label">Portrait URL <span class="optional-label">optional</span></label>
<input
            id="avatarUrl"
            v-model="authorForm.avatarUrl"
            type="url"
            class="form-control"
            :class="{ 'is-invalid': !!fieldError('avatarUrl') }"
            :aria-invalid="!!fieldError('avatarUrl')"
            :aria-describedby="'avatarUrl-message'"
            placeholder="https://example.com/portrait.jpg"
            @blur="touch('avatarUrl')" />
<p v-if="fieldError('avatarUrl')" id="avatarUrl-message" class="field-error">{{ fieldError('avatarUrl') }}</p>
<p v-else id="avatarUrl-message" class="field-hint">Use a public http or https image URL. Leave blank to use initials.</p>
</div><div class="form-field">
<label for="bio" class="form-label">Biography <span class="optional-label">optional</span></label>

          <textarea
            id="bio"
            v-model="authorForm.bio"
            rows="8"
            class="form-control"
            :class="{ 'is-invalid': !!fieldError('bio') }"
            :aria-invalid="!!fieldError('bio')"
            :aria-describedby="'bio-message'"
            placeholder="Tell us a little about their life, work, and the worlds they create…"
            @blur="touch('bio')"
          ></textarea>
        
<p v-if="fieldError('bio')" id="bio-message" class="field-error">{{ fieldError('bio') }}</p>
<p v-else id="bio-message" class="field-hint">{{ `${authorForm.bio.length} / 800 characters` }}</p>
</div>
        <p v-if="serverError" class="field-error" role="alert">{{ serverError }}</p>
        <div class="form-actions">
          <RouterLink to="/admin/authors" class="btn btn-outline-secondary">Cancel</RouterLink
          ><button class="btn btn-primary" :disabled="!canSubmit">
            <span v-if="saving" class="spinner-border spinner-border-sm"></span
            ><AppIcon v-else name="check" :size="18" />{{
              saving ? 'Saving…' : editing ? 'Save changes' : 'Add author'
            }}
          </button>
        </div>
      </form>
      <aside class="form-preview author-preview">
        <p class="eyebrow">MEET YOUR STORYTELLER</p>
        <AuthorAvatar :author="authorPreview" />
        <h3>{{ authorPreview.name }}</h3>
        <p class="preview-bio">{{ authorForm.bio || 'Their story starts here.' }}</p>
        <p class="preview-note">
          <AppIcon name="leaf" :size="17" /> Behind every great book is a voice worth knowing.
        </p>
      </aside>
    </div></DataState
  >
</template>
<dialog ref="dialog" class="confirm-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" @cancel.prevent="cancelDelete">
  <span class="delete-symbol"><AppIcon name="trash" :size="25" /></span>
  <h2 id="delete-title">{{ isBooks ? 'Remove this book?' : 'Remove this author?' }}</h2>
  <p id="delete-description">{{ deleteMessage }}</p>
  <div class="d-flex justify-content-end gap-2">
    <button autofocus class="btn btn-outline-secondary" :disabled="deleting" @click="cancelDelete">Keep it</button>
    <button class="btn btn-danger" :disabled="deleting" @click="confirmDelete">{{ deleting ? 'Deleting…' : 'Yes, delete' }}</button>
  </div>
</dialog>
</div>
      <footer class="admin-footer">
        Folio library workspace <span>One good story at a time.</span>
      </footer>
    </div>
  </div>
</template>
