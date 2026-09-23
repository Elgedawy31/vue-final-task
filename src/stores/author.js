import { defineStore } from "pinia";
import { ref } from "vue";
import { API_URL } from "../config.js";

const API = `${API_URL}/authors`;

export const useAuthorStore = defineStore("author", () => {
  // State
  const authors = ref([]);
  const loading = ref(false);
  const error = ref(false);

  const selectedAuthor = ref(null);
  const selectedLoading = ref(false);
  const selectedError = ref(false);

  // Actions
  const getAllAuthors = async () => {
    try {
      loading.value = true;
      error.value = false;
      const response = await fetch(API);
      authors.value = await response.json();
    } catch (e) {
      error.value = true;
    } finally {
      loading.value = false;
    }
  };

  const getAuthorById = async (id) => {
    try {
      selectedLoading.value = true;
      selectedError.value = false;
      selectedAuthor.value = null;

      const response = await fetch(`${API}/${id}`);
      if (!response.ok) return;

      selectedAuthor.value = await response.json();
    } catch (e) {
      selectedError.value = true;
    } finally {
      selectedLoading.value = false;
    }
  };

  const createAuthor = async (author) => {
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(author),
    });
    const created = await response.json();
    authors.value.push(created);
  };

  const updateAuthor = async (id, author) => {
    const response = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(author),
    });
    const updated = await response.json();
    const index = authors.value.findIndex((a) => a.id === id);
    if (index !== -1) authors.value[index] = updated;
  };

  const deleteAuthor = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    authors.value = authors.value.filter((a) => a.id !== id);
  };

  return {
    authors,
    loading,
    error,
    selectedAuthor,
    selectedLoading,
    selectedError,
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,
  };
});
