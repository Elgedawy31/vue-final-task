<template>
  <div class="d-flex justify-content-between align-items-end mb-4">
    <div>
      <p class="eyebrow mb-2">Admin</p>
      <h2 class="mb-0">Authors</h2>
    </div>

    <RouterLink to="/admin/authors/new" class="btn btn-primary">Add Author</RouterLink>
  </div>

  <DataState
    :loading="loading"
    :error="error"
    :empty="authors.length === 0"
    empty-text="No authors yet. Use Add Author to create one."
    @retry="getAllAuthors"
  >
    <div class="card table-responsive" style="max-height: 520px; overflow-y: auto">
      <table class="table table-hover align-middle mb-0">
        <thead class="position-sticky top-0">
          <tr>
            <th>Name</th>
            <th>Bio</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="author in authors" :key="author.id">
            <td>{{ author.name }}</td>
            <td class="text-muted small">{{ shortBio(author.bio) }}</td>
            <td class="text-end">
              <RouterLink
                :to="`/admin/authors/${author.id}/edit`"
                class="btn btn-sm btn-outline-primary me-1"
              >
                Edit
              </RouterLink>
              <button class="btn btn-sm btn-outline-danger" @click="handleDelete(author)">
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
import { useAuthorStore } from "../stores/author.js";
import { useToastStore } from "../stores/toast.js";
import { useConfirmStore } from "../stores/confirm.js";

const authorStore = useAuthorStore();
const toastStore = useToastStore();
const { askConfirm } = useConfirmStore();

const { authors, loading, error } = storeToRefs(authorStore);
const { getAllAuthors, deleteAuthor } = authorStore;
const { showToast } = toastStore;

const shortBio = (bio) => {
  if (!bio) return "No biography yet.";
  if (bio.length <= 80) return bio;
  return bio.slice(0, 80) + "...";
};

const handleDelete = async (author) => {
  const ok = await askConfirm({
    title: "Delete author?",
    message: `"${author.name}" will be removed for good.`,
  });
  if (!ok) return;

  try {
    await deleteAuthor(author.id);
    showToast("Author deleted.");
  } catch (e) {
    showToast("Could not delete the author.", "error");
  }
};

onMounted(getAllAuthors);
</script>
