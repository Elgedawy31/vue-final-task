<template>
  <div class="d-flex justify-content-between align-items-end mb-4">
    <div>
      <p class="eyebrow mb-2">Admin</p>
      <h2 class="mb-0">Books</h2>
    </div>

    <RouterLink to="/admin/books/new" class="btn btn-primary">Add Book</RouterLink>
  </div>

  <DataState
    :loading="loading"
    :error="error"
    :empty="books.length === 0"
    empty-text="No books yet. Use Add Book to create one."
    @retry="loadData"
  >
    <div class="card table-responsive" style="max-height: 520px; overflow-y: auto">
      <table class="table table-hover align-middle mb-0">
        <thead class="position-sticky top-0">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Year</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="book in books" :key="book.id">
            <td>{{ book.title }}</td>
            <td>{{ getAuthorName(book.authorId) }}</td>
            <td>{{ book.year }}</td>
            <td class="text-end">
              <RouterLink :to="`/admin/books/${book.id}/edit`" class="btn btn-sm btn-outline-primary me-1">
                Edit
              </RouterLink>
              <button class="btn btn-sm btn-outline-danger" @click="handleDelete(book)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DataState>
</template>

<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import DataState from "../components/DataState.vue";
import { useBookStore } from "../stores/book.js";
import { useAuthorStore } from "../stores/author.js";
import { useToastStore } from "../stores/toast.js";

const bookStore = useBookStore();
const authorStore = useAuthorStore();
const toastStore = useToastStore();

const { books, loading, error } = storeToRefs(bookStore);
const { authors } = storeToRefs(authorStore);
const { getAllBooks, deleteBook } = bookStore;
const { getAllAuthors } = authorStore;
const { showToast } = toastStore;

const getAuthorName = (authorId) => {
  const author = authors.value.find((a) => a.id === authorId);
  return author ? author.name : "Unknown author";
};

const handleDelete = async (book) => {
  if (!confirm(`Delete "${book.title}"?`)) return;

  try {
    await deleteBook(book.id);
    showToast("Book deleted.");
  } catch (e) {
    showToast("Could not delete the book.", "error");
  }
};

const loadData = async () => {
  await getAllBooks();
  await getAllAuthors();
};

onMounted(loadData);
</script>
