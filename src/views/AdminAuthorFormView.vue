<template>
  <p class="eyebrow mb-2">Authors</p>
  <h2 class="mb-4">{{ isEdit ? "Edit Author" : "Add Author" }}</h2>

  <form @submit.prevent="handleSubmit" novalidate class="card">
    <div class="card-body p-4">
      <div class="mb-3">
        <label class="form-label" for="name">Name</label>
        <input
          id="name"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
          :aria-invalid="errors.name ? 'true' : 'false'"
          v-model="form.name"
        />
        <div class="invalid-feedback">{{ errors.name }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="bio">Bio</label>
        <textarea
          id="bio"
          rows="5"
          class="form-control"
          :class="{ 'is-invalid': errors.bio }"
          :aria-invalid="errors.bio ? 'true' : 'false'"
          v-model="form.bio"
        ></textarea>
        <div class="form-text">{{ form.bio.length }} / 800</div>
        <div class="invalid-feedback">{{ errors.bio }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="avatarUrl">Avatar URL</label>
        <input
          id="avatarUrl"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.avatarUrl }"
          :aria-invalid="errors.avatarUrl ? 'true' : 'false'"
          v-model="form.avatarUrl"
        />
        <div class="invalid-feedback">{{ errors.avatarUrl }}</div>
      </div>

      <button type="submit" class="btn btn-primary me-2" :disabled="!isValid || saving">
        {{ saving ? "Saving..." : "Save" }}
      </button>

      <RouterLink to="/admin/authors" class="btn btn-outline-secondary">Cancel</RouterLink>
    </div>
  </form>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthorStore } from "../stores/author.js";
import { useToastStore } from "../stores/toast.js";

const route = useRoute();
const router = useRouter();
const authorStore = useAuthorStore();
const toastStore = useToastStore();

const { getAuthorById, createAuthor, updateAuthor } = authorStore;
const { showToast } = toastStore;

const isEdit = computed(() => Boolean(route.params.id));
const saving = ref(false);

const form = reactive({
  name: "",
  bio: "",
  avatarUrl: "",
});

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch (e) {
    return false;
  }
};

const errors = computed(() => {
  const result = {};

  if (form.name.trim().length < 2 || form.name.trim().length > 60) {
    result.name = "Name must be between 2 and 60 characters.";
  }

  if (form.bio.length > 800) {
    result.bio = "Bio must be 800 characters or less.";
  }

  if (form.avatarUrl && !isValidUrl(form.avatarUrl)) {
    result.avatarUrl = "Please enter a valid URL.";
  }

  return result;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

const handleSubmit = async () => {
  if (!isValid.value) return;

  saving.value = true;

  const payload = {
    name: form.name.trim(),
    bio: form.bio.trim(),
    avatarUrl: form.avatarUrl.trim(),
    updatedAt: new Date().toISOString(),
  };

  try {
    if (isEdit.value) {
      await updateAuthor(route.params.id, payload);
      showToast("Author updated.");
    } else {
      payload.createdAt = new Date().toISOString();
      await createAuthor(payload);
      showToast("Author created.");
    }

    router.push("/admin/authors");
  } catch (e) {
    showToast("Could not save the author.", "error");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  if (!isEdit.value) return;

  await getAuthorById(route.params.id);

  if (authorStore.selectedAuthor) {
    form.name = authorStore.selectedAuthor.name || "";
    form.bio = authorStore.selectedAuthor.bio || "";
    form.avatarUrl = authorStore.selectedAuthor.avatarUrl || "";
  }
});
</script>
