<template>
  <p class="eyebrow mb-2">Books</p>
  <h2 class="mb-4">{{ isEdit ? "Edit Book" : "Add Book" }}</h2>

  <form @submit.prevent="handleSubmit" novalidate class="card">
    <div class="card-body p-4">
      <!-- Title -->
      <div class="mb-3">
        <label class="form-label" for="title">Title</label>
        <input
          id="title"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.title }"
          :aria-invalid="errors.title ? 'true' : 'false'"
          v-model="form.title"
        />
        <div class="invalid-feedback">{{ errors.title }}</div>
      </div>

      <!-- Author -->
      <div class="mb-3">
        <label class="form-label" for="authorId">Author</label>
        <select
          id="authorId"
          class="form-select"
          :class="{ 'is-invalid': errors.authorId }"
          :aria-invalid="errors.authorId ? 'true' : 'false'"
          v-model="form.authorId"
        >
          <option value="">Choose an author</option>
          <option v-for="author in authors" :key="author.id" :value="author.id">
            {{ author.name }}
          </option>
        </select>
        <div class="invalid-feedback">{{ errors.authorId }}</div>
      </div>

      <!-- Year -->
      <div class="mb-3">
        <label class="form-label" for="year">Year</label>
        <input
          id="year"
          type="number"
          class="form-control"
          :class="{ 'is-invalid': errors.year }"
          :aria-invalid="errors.year ? 'true' : 'false'"
          v-model.number="form.year"
        />
        <div class="invalid-feedback">{{ errors.year }}</div>
      </div>

      <!-- Tags -->
      <div class="mb-3">
        <label class="form-label" for="tags">Tags</label>
        <input
          id="tags"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.tags }"
          :aria-invalid="errors.tags ? 'true' : 'false'"
          v-model="tagsText"
        />
        <div class="form-text">Separate tags with a comma. Up to 8 tags.</div>
        <div class="invalid-feedback">{{ errors.tags }}</div>
      </div>

      <!-- Cover URL -->
      <div class="mb-3">
        <label class="form-label" for="coverUrl">Cover URL</label>
        <input
          id="coverUrl"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.coverUrl }"
          :aria-invalid="errors.coverUrl ? 'true' : 'false'"
          v-model="form.coverUrl"
        />
        <div class="invalid-feedback">{{ errors.coverUrl }}</div>
      </div>

      <!-- Description -->
      <div class="mb-3">
        <label class="form-label" for="description">Description</label>
        <textarea
          id="description"
          rows="5"
          class="form-control"
          :class="{ 'is-invalid': errors.description }"
          :aria-invalid="errors.description ? 'true' : 'false'"
          v-model="form.description"
        ></textarea>
        <div class="form-text">{{ form.description.length }} / 2000</div>
        <div class="invalid-feedback">{{ errors.description }}</div>
      </div>

      <button type="submit" class="btn btn-primary me-2" :disabled="!isValid || saving">
        {{ saving ? "Saving..." : "Save" }}
      </button>

      <RouterLink to="/admin/books" class="btn btn-outline-secondary">Cancel</RouterLink>
    </div>
  </form>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useBookStore } from "../stores/book.js";
import { useAuthorStore } from "../stores/author.js";
import { useToastStore } from "../stores/toast.js";

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();
const authorStore = useAuthorStore();
const toastStore = useToastStore();

const { books } = storeToRefs(bookStore);
const { authors } = storeToRefs(authorStore);
const { getAllBooks, getBookById, createBook, updateBook } = bookStore;
const { getAllAuthors } = authorStore;
const { showToast } = toastStore;

const isEdit = computed(() => Boolean(route.params.id));
const saving = ref(false);

const form = reactive({
  title: "",
  authorId: "",
  year: new Date().getFullYear(),
  coverUrl: "",
  description: "",
});

const tagsText = ref("");

const tagList = computed(() =>
  tagsText.value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "")
);

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch (e) {
    return false;
  }
};

const isDuplicateTitle = computed(() =>
  books.value.some(
    (book) =>
      book.id !== route.params.id &&
      book.authorId === form.authorId &&
      book.title.trim().toLowerCase() === form.title.trim().toLowerCase()
  )
);

const errors = computed(() => {
  const result = {};

  if (form.title.trim().length < 3 || form.title.trim().length > 100) {
    result.title = "Title must be between 3 and 100 characters.";
  } else if (isDuplicateTitle.value) {
    result.title = "This author already has a book with this title.";
  }

  if (!form.authorId) {
    result.authorId = "Please choose an author.";
  }

  const currentYear = new Date().getFullYear();
  if (!form.year || form.year < 1800 || form.year > currentYear) {
    result.year = `Year must be between 1800 and ${currentYear}.`;
  }

  if (tagList.value.length > 8) {
    result.tags = "You can add up to 8 tags.";
  } else if (tagList.value.some((tag) => tag.length < 2 || tag.length > 20)) {
    result.tags = "Each tag must be between 2 and 20 characters.";
  }

  if (form.coverUrl && !isValidUrl(form.coverUrl)) {
    result.coverUrl = "Please enter a valid URL.";
  }

  if (form.description.length > 2000) {
    result.description = "Description must be 2000 characters or less.";
  }

  return result;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

// The spec asks us to confirm the author exists by calling the API
// and checking the status code before we save.
const authorExists = async (authorId) => {
  const response = await fetch(`http://localhost:3000/authors/${authorId}`);
  return response.ok;
};

const handleSubmit = async () => {
  if (!isValid.value) return;

  saving.value = true;

  try {
    const exists = await authorExists(form.authorId);

    if (!exists) {
      showToast("That author no longer exists.", "error");
      return;
    }

    const payload = {
      title: form.title.trim(),
      authorId: form.authorId,
      year: form.year,
      tags: tagList.value,
      coverUrl: form.coverUrl.trim(),
      description: form.description.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (isEdit.value) {
      await updateBook(route.params.id, payload);
      showToast("Book updated.");
    } else {
      payload.createdAt = new Date().toISOString();
      await createBook(payload);
      showToast("Book created.");
    }

    router.push("/admin/books");
  } catch (e) {
    showToast("Could not save the book.", "error");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await getAllAuthors();
  await getAllBooks();

  if (!isEdit.value) return;

  await getBookById(route.params.id);

  if (bookStore.selectedBook) {
    form.title = bookStore.selectedBook.title || "";
    form.authorId = bookStore.selectedBook.authorId || "";
    form.year = bookStore.selectedBook.year || new Date().getFullYear();
    form.coverUrl = bookStore.selectedBook.coverUrl || "";
    form.description = bookStore.selectedBook.description || "";
    tagsText.value = (bookStore.selectedBook.tags || []).join(", ");
  }
});
</script>
